import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProposalLinkRequest {
  proposal_id: string;
  responsible_name: string;
  responsible_cpf: string;
  responsible_position: string;
  responsible_email?: string;
  responsible_phone?: string;
  client_email?: string;
  client_phone?: string;
  send_method: 'email' | 'whatsapp' | 'both';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const {
      proposal_id,
      responsible_name,
      responsible_cpf,
      responsible_position,
      responsible_email,
      responsible_phone,
      client_email,
      client_phone,
      send_method
    }: ProposalLinkRequest = await req.json();

    console.log('Processando solicitação de envio de proposta:', { 
      proposal_id, 
      responsible_name, 
      send_method 
    });

    // Generate unique public link
    const publicToken = crypto.randomUUID();
    const publicLink = `proposal-${publicToken}`;

    // Update proposal with responsible data and public link
    const { data: proposal, error: updateError } = await supabase
      .from('proposals')
      .update({
        responsible_name,
        responsible_cpf,
        responsible_position,
        responsible_email,
        responsible_phone,
        public_link: publicLink,
        status: 'sent'
      })
      .eq('id', proposal_id)
      .select(`
        *,
        opportunity:opportunities(
          *,
          client:rep_clients(*),
          items:opportunity_items(*)
        )
      `)
      .single();

    if (updateError) {
      console.error('Erro ao atualizar proposta:', updateError);
      throw updateError;
    }

    console.log('Proposta atualizada com sucesso:', proposal.proposal_number);

    // Prepare proposal link - use APP_URL from environment or construct from request
    const appUrl = Deno.env.get('APP_URL') || 'https://agroikemba.lovable.app';
    const proposalUrl = `${appUrl}/proposta/${publicLink}`;
    
    console.log('📧 Gerando URL da proposta:', proposalUrl);

    // Send via email if requested
    if ((send_method === 'email' || send_method === 'both') && (client_email || responsible_email)) {
      const emailTo = client_email || responsible_email;
      
      const emailResponse = await resend.emails.send({
        from: "AgroIkemba <noreply@agroikemba.com>",
        to: [emailTo!],
        subject: `Proposta ${proposal.proposal_number} - AgroIkemba`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #22c55e;">Nova Proposta - AgroIkemba</h1>
            
            <p>Olá <strong>${responsible_name}</strong>,</p>
            
            <p>Recebemos uma nova proposta comercial para análise:</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>Detalhes da Proposta</h3>
              <p><strong>Número:</strong> ${proposal.proposal_number}</p>
              <p><strong>Cliente:</strong> ${proposal.opportunity.client.company_name}</p>
              <p><strong>Valor Total:</strong> R$ ${proposal.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              <p><strong>Validade:</strong> ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</p>
            </div>
            
            <p style="text-align: center; margin: 30px 0;">
              <a href="${proposalUrl}" 
                 style="background-color: #22c55e; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                VISUALIZAR PROPOSTA
              </a>
            </p>
            
            <p style="color: #666; font-size: 14px;">
              Este link é único e seguro. Você pode acessá-lo para revisar todos os detalhes da proposta e tomar uma decisão.
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="color: #999; font-size: 12px;">
              AgroIkemba - Insumos Agrícolas<br>
              Este é um email automático, não responda.
            </p>
          </div>
        `,
      });

      console.log('Email enviado:', emailResponse);
    }

    // Send via WhatsApp if requested
    if ((send_method === 'whatsapp' || send_method === 'both') && (client_phone || responsible_phone)) {
      const whatsappPhone = client_phone || responsible_phone;
      
      // Call WhatsApp function
      const { error: whatsappError } = await supabase.functions.invoke('send-whatsapp', {
        body: {
          to: whatsappPhone,
          message: `🌱 *AgroIkemba - Nova Proposta*\n\nOlá ${responsible_name}!\n\nVocê tem uma nova proposta para análise:\n\n📋 *Proposta:* ${proposal.proposal_number}\n🏢 *Cliente:* ${proposal.opportunity.client.company_name}\n💰 *Valor:* R$ ${proposal.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}\n📅 *Validade:* ${new Date(proposal.validity_date).toLocaleDateString('pt-BR')}\n\n👆 *Clique no link para visualizar:*\n${proposalUrl}\n\n_Link único e seguro_`
        }
      });

      if (whatsappError) {
        console.warn('Erro ao enviar WhatsApp:', whatsappError);
      } else {
        console.log('WhatsApp enviado com sucesso');
      }
    }

    // Create notification for representative
    const { error: notificationError } = await supabase
      .from('rep_notifications')
      .insert({
        representative_id: proposal.opportunity.representative_id,
        title: 'Proposta Enviada',
        message: `Proposta ${proposal.proposal_number} foi enviada para ${proposal.opportunity.client.company_name}`,
        type: 'success',
        link: `/representative/propostas/${proposal.id}`
      });

    if (notificationError) {
      console.warn('Erro ao criar notificação:', notificationError);
    }

    return new Response(JSON.stringify({
      success: true,
      proposal_number: proposal.proposal_number,
      public_link: publicLink,
      proposal_url: proposalUrl,
      message: 'Proposta enviada com sucesso!'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error('Erro na função send-proposal-link:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { 
          'Content-Type': 'application/json', 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);