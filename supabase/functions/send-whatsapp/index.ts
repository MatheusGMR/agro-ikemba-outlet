
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  to: string;
  name: string;
  status: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('=== INÍCIO DA FUNÇÃO SEND-WHATSAPP ===');
  console.log('Método:', req.method);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Retornando headers CORS para OPTIONS');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN');
    const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_ID');

    if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) {
      console.error('Credenciais do WhatsApp não configuradas');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciais do WhatsApp não configuradas' 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    const { to, name, status }: WhatsAppMessage = await req.json();
    console.log('Dados recebidos:', { to, name, status });

    // Limpar o número de telefone (remover caracteres não numéricos)
    const cleanPhone = to.replace(/\D/g, '');
    
    // Garantir que o número tenha o código do país (55 para Brasil)
    const phoneNumber = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    let message = '';
    if (status === 'approved') {
      message = `Olá ${name}! 🎉\n\nSeu cadastro na Agro Ikemba foi *APROVADO*!\n\nAgora você pode acessar nossa plataforma e começar a revolucionar suas compras de produtos pós-patente.\n\nBem-vindo(a) à família Agro Ikemba! 🌱\n\nAcesse: https://agroikemba.com`;
    } else if (status === 'rejected') {
      message = `Olá ${name},\n\nInfelizmente, não foi possível aprovar seu cadastro na Agro Ikemba no momento.\n\nPara mais informações, entre em contato conosco.\n\nObrigado pelo interesse! 🌱`;
    }

    console.log('Enviando WhatsApp para:', phoneNumber);
    console.log('Mensagem:', message);

    // Enviar mensagem via WhatsApp Business API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'text',
        text: {
          body: message
        }
      })
    });

    const whatsappData = await whatsappResponse.json();
    
    if (!whatsappResponse.ok) {
      console.error('Erro na API do WhatsApp:', whatsappData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Erro ao enviar WhatsApp',
          details: whatsappData 
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('WhatsApp enviado com sucesso:', whatsappData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: whatsappData.messages?.[0]?.id,
        phone: phoneNumber
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error) {
    console.error('Erro inesperado:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro inesperado ao enviar WhatsApp' 
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

console.log('WhatsApp function initialized');
serve(handler);
