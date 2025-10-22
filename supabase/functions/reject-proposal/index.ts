import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RejectionRequest {
  proposal_id: string;
  comments?: string;
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

    const { proposal_id, comments }: RejectionRequest = await req.json();

    console.log('Processing proposal rejection:', { proposal_id, comments });

    // Update proposal status to rejected
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update({
        status: 'rejected',
        client_comments: comments || 'Proposta rejeitada pelo cliente'
      })
      .eq('id', proposal_id)
      .select('*, opportunity:opportunities!inner(representative_id)')
      .single();

    if (updateError) {
      console.error('Error updating proposal:', updateError);
      throw updateError;
    }

    console.log('Proposal updated to rejected, trigger will cancel reservations automatically');

    // Optional: Explicitly cancel reservations via RPC (backup in case trigger fails)
    try {
      const { error: cancelError } = await supabase.rpc('cancel_inventory_reservation', {
        p_proposal_id: proposal_id
      });

      if (cancelError) {
        console.error('Error calling cancel_inventory_reservation RPC (non-blocking):', cancelError);
        // Don't fail the rejection because of this - trigger should handle it
      } else {
        console.log('Successfully called cancel_inventory_reservation RPC');
      }
    } catch (rpcError) {
      console.error('RPC call failed (non-blocking):', rpcError);
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
          title: 'Proposta Rejeitada',
          message: `A proposta #${updatedProposal.proposal_number} foi rejeitada pelo cliente.${comments ? ` Comentários: ${comments}` : ''}`,
          type: 'warning',
          link: `/representative?tab=proposals&id=${proposal_id}`
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
      }
    }

    // TODO: Send email notification to representative
    // You can integrate with Resend here if needed

    console.log('Proposal rejected:', {
      proposal_id,
      comments,
      representative_id: updatedProposal.opportunity.representative_id
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Resposta registrada com sucesso.',
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
    console.error('Error in reject-proposal function:', error);
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