import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApprovalRequest {
  proposal_id: string;
  approval_data: {
    client_name: string;
    client_position: string;
    client_email?: string;
    client_phone?: string;
    comments?: string;
    signature?: string;
  };
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

    const { proposal_id, approval_data }: ApprovalRequest = await req.json();

    // Update proposal status to approved
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({
        status: 'approved',
        client_approved_at: new Date().toISOString(),
        client_comments: `Aprovado por: ${approval_data.client_name} (${approval_data.client_position})${approval_data.client_email ? ` - ${approval_data.client_email}` : ''}${approval_data.client_phone ? ` - ${approval_data.client_phone}` : ''}${approval_data.comments ? `\nComentários: ${approval_data.comments}` : ''}`
      })
      .eq('id', proposal_id)
      .select('*, opportunity:opportunities!inner(representative_id)')
      .single();

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      throw updateError;
    }

    // Get representative data for notification
    const { data: representative, error: repError } = await supabase
      .from('representatives')
      .select('name, email')
      .eq('id', updatedProposal.opportunity.representative_id)
      .single();

    if (repError) {
      console.error('Error fetching representative:', repError);
    }

    // Create notification for representative
    if (representative) {
      const { error: notificationError } = await supabase
        .from('rep_notifications')
        .insert({
          representative_id: updatedProposal.opportunity.representative_id,
          title: 'Proposta Aprovada!',
          message: `A proposta #${updatedProposal.proposal_number} foi aprovada pelo cliente.`,
          type: 'success',
          link: `/representative?tab=proposals&id=${proposal_id}`
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    // TODO: Send email notification to representative
    // You can integrate with Resend here if needed

    console.log('Proposal approved successfully:', {
      proposal_id,
      client_name: approval_data.client_name,
      representative_id: updatedProposal.opportunity.representative_id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Proposta aprovada com sucesso!',
        proposal: updatedProposal
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error in approve-proposal function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor' 
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