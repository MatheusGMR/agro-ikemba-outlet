import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Received Asaas webhook...');

    const webhook = await req.json();
    console.log('Webhook data:', webhook);

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { event, payment } = webhook;

    if (!payment || !payment.externalReference) {
      console.log('No external reference found, ignoring webhook');
      return new Response('OK', { status: 200 });
    }

    console.log('Processing payment event:', event, 'for order:', payment.externalReference);

    let orderStatus = '';
    let paymentConfirmedAt = null;

    switch (event) {
      case 'PAYMENT_RECEIVED':
      case 'PAYMENT_CONFIRMED':
        orderStatus = 'paid';
        paymentConfirmedAt = new Date().toISOString();
        break;
      case 'PAYMENT_OVERDUE':
        orderStatus = 'overdue';
        break;
      case 'PAYMENT_DELETED':
        orderStatus = 'cancelled';
        break;
      default:
        console.log('Unhandled payment event:', event);
        return new Response('OK', { status: 200 });
    }

    // Update order status
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        status: orderStatus,
        payment_confirmed_at: paymentConfirmedAt,
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.externalReference);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log(`Order ${payment.externalReference} updated to status: ${orderStatus}`);

    return new Response('OK', { 
      headers: corsHeaders,
      status: 200 
    });

  } catch (error) {
    console.error('Error in asaas-webhook:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});