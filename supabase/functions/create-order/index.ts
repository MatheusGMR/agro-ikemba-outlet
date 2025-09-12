import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
  manufacturer?: string;
}

interface CreateOrderRequest {
  items: OrderItem[];
  total_amount: number;
  payment_method: string;
  logistics_option: string;
  delivery_info?: string;
  delivery_quote_requested?: boolean;
  idempotency_key: string;
}

serve(async (req) => {
  console.time('create-order-total');
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT
    const authorization = req.headers.get('authorization');
    if (!authorization) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authorization.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    const requestData: CreateOrderRequest = await req.json();
    console.log('📦 Creating order for user:', user.id, 'with idempotency:', requestData.idempotency_key);

    // Check for duplicate order using idempotency key
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('id, order_number, total_amount, status')
      .eq('user_id', user.id)
      .eq('external_id', requestData.idempotency_key)
      .maybeSingle();

    if (existingOrder) {
      console.log('⚡ Returning existing order:', existingOrder.order_number);
      return new Response(JSON.stringify({
        success: true,
        order: existingOrder,
        message: 'Order already exists'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.time('database-insert');
    
    // Create new order with optimized query
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        external_id: requestData.idempotency_key,
        items: requestData.items,
        total_amount: requestData.total_amount,
        payment_method: requestData.payment_method,
        logistics_option: requestData.logistics_option,
        status: 'pending'
      })
      .select('id, order_number, total_amount, status, created_at')
      .single();

    console.timeEnd('database-insert');

    if (orderError) {
      console.error('❌ Database error:', orderError);
      throw orderError;
    }

    console.log('✅ Order created:', orderData.order_number);

    // Immediately return success response
    const response = new Response(JSON.stringify({
      success: true,
      order: {
        id: orderData.id,
        order_number: orderData.order_number,
        total_amount: orderData.total_amount,
        status: orderData.status,
        created_at: orderData.created_at
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

    // Use EdgeRuntime.waitUntil for all background tasks
    EdgeRuntime.waitUntil(
      (async () => {
        try {
          // Parallel execution of background tasks
          const backgroundTasks = [
            // Send order confirmation email
            (async () => {
              try {
                console.time('email-confirmation');
                
                // Get user profile data (fallback to auth email)
                const { data: userData } = await supabase
                  .from('users')
                  .select('name, email, phone, company')
                  .eq('id', user.id)
                  .maybeSingle();

                const safeUser = {
                  name: userData?.name || user.email?.split('@')[0] || 'Cliente',
                  email: userData?.email || user.email || '',
                  phone: userData?.phone || '',
                  company: userData?.company || ''
                };

                await supabase.functions.invoke('send-order-confirmation', {
                  body: {
                    orderData: {
                      order_number: orderData.order_number,
                      total_amount: orderData.total_amount,
                      payment_method: orderData.payment_method,
                      logistics_option: orderData.logistics_option,
                      items: requestData.items
                    },
                    userData: safeUser
                  }
                });

                console.timeEnd('email-confirmation');
                console.log('📧 Email confirmation sent for:', orderData.order_number);
              } catch (error) {
                console.error('📧 Email confirmation failed (non-blocking):', error);
              }
            })(),

            // Track analytics
            (async () => {
              try {
                console.log('📊 Tracking conversion analytics for:', orderData.order_number);
                
                const { error: analyticsError } = await supabase
                  .from('checkout_funnel_logs')
                  .insert({
                    session_id: `order-${orderData.id}`,
                    user_id: user.id,
                    checkout_step: 'order_completed',
                    action_type: 'conversion',
                    step_data: {
                      order_id: orderData.id,
                      order_number: orderData.order_number,
                      total_amount: orderData.total_amount,
                      payment_method: requestData.payment_method,
                      items_count: requestData.items.length
                    }
                  });

                if (analyticsError) {
                  console.error('📊 Analytics tracking failed:', analyticsError);
                } else {
                  console.log('📊 Analytics tracked successfully');
                }
              } catch (error) {
                console.error('📊 Analytics task failed:', error);
              }
            })()
          ];

          // Wait for all background tasks to complete
          await Promise.allSettled(backgroundTasks);
          console.log('✅ All background tasks completed');

        } catch (backgroundError) {
          console.error('❌ Error in background tasks:', backgroundError);
        }
      })()
    );

    console.timeEnd('create-order-total');
    return response;

  } catch (error: any) {
    console.error('💥 Order creation failed:', error);
    console.timeEnd('create-order-total');
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});