import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessOrderRequest {
  orderId: string;
  paymentMethod: 'boleto' | 'pix' | 'ted';
  userInfo: {
    name: string;
    email: string;
    phone: string;
    cpfCnpj?: string;
  };
  orderValue: number;
  items: any[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting background order processing...');

    const { 
      orderId, 
      paymentMethod, 
      userInfo, 
      orderValue, 
      items 
    }: ProcessOrderRequest = await req.json();

    console.log('Processing order:', orderId, 'Payment method:', paymentMethod);

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let result: any = {};

    // Generate payment-specific instructions or documents
    switch (paymentMethod) {
      case 'boleto':
        console.log('Processing boleto payment method - async mode');
        
        // Return immediately with pending status
        result = {
          type: 'boleto',
          status: 'pending',
          message: 'Boleto sendo gerado. Aguarde...'
        };

        // Start boleto generation in background
        EdgeRuntime.waitUntil(
          (async () => {
            try {
              console.log('Starting background boleto generation for order:', orderId);
              
              // Call create-boleto function
              const { data: boletoData, error: boletoError } = await supabaseAdmin.functions.invoke(
                'create-boleto',
                {
                  body: {
                    orderId: orderId,
                    customerName: userInfo.name,
                    customerCpfCnpj: userInfo.cpfCnpj || '000.000.000-00',
                    customerEmail: userInfo.email,
                    customerPhone: userInfo.phone,
                    amount: orderValue,
                    description: `Pedido ${orderId} - AgroIkemba`,
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  }
                }
              );

              if (boletoError) {
                console.error('Background boleto generation failed:', boletoError);
                // Update order status to failed
                await supabaseAdmin
                  .from('orders')
                  .update({ 
                    status: 'payment_generation_failed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', orderId);
              } else {
                console.log('Background boleto generation completed for order:', orderId);
              }
            } catch (error) {
              console.error('Background boleto generation error:', error);
              await supabaseAdmin
                .from('orders')
                .update({ 
                  status: 'payment_generation_failed',
                  updated_at: new Date().toISOString()
                })
                .eq('id', orderId);
            }
          })()
        );
        
        break;

      case 'pix':
        console.log('Generating PIX instructions...');
        result = {
          type: 'pix',
          instructions: 'PIX em desenvolvimento. Use o boleto por enquanto.',
          qrCode: null,
          pixKey: null,
        };
        break;

      case 'ted':
        console.log('Generating TED instructions...');
        result = {
          type: 'ted',
          instructions: 'TED em desenvolvimento. Use o boleto por enquanto.',
          bankDetails: null,
        };
        break;
    }

    // Log analytics
    try {
      await supabaseAdmin.from('checkout_funnel_logs').insert({
        session_id: `session_${Date.now()}`,
        checkout_step: 'payment_processed',
        action_type: 'payment_document_generated',
        step_data: {
          order_id: orderId,
          payment_method: paymentMethod,
          value: orderValue,
          items_count: items.length,
        },
      });
    } catch (analyticsError) {
      console.warn('Analytics logging failed:', analyticsError);
      // Don't fail the main process for analytics
    }

    console.log('Order processing completed successfully');

    return new Response(JSON.stringify({
      success: true,
      paymentInfo: result,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in process-order function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});