import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BoletoRequest {
  orderId: string;
  customerName: string;
  customerCpfCnpj: string;
  customerEmail: string;
  customerPhone: string;
  amount: number;
  description: string;
  dueDate: string; // Format: YYYY-MM-DD
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting boleto creation process...');

    // Get request data
    const { 
      orderId, 
      customerName, 
      customerCpfCnpj, 
      customerEmail, 
      customerPhone, 
      amount, 
      description, 
      dueDate 
    }: BoletoRequest = await req.json();

    console.log('Received boleto request:', { orderId, amount, customerEmail });

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Asaas API configuration with environment support
    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY');
    const ASAAS_BASE_URL = Deno.env.get('ASAAS_API_BASE_URL') || 'https://sandbox.asaas.com/api/v3';

    console.log('Using Asaas environment:', ASAAS_BASE_URL);
    console.log('API Key configured:', ASAAS_API_KEY ? 'Yes' : 'No');

    if (!ASAAS_API_KEY) {
      throw new Error('ASAAS_API_KEY not configured');
    }

    // Validate input data
    if (!customerName || !customerCpfCnpj || !customerEmail) {
      throw new Error('Missing required customer information');
    }

    if (!amount || amount <= 0) {
      throw new Error('Invalid amount value');
    }

    // Create customer in Asaas if doesn't exist
    console.log('Creating/updating customer in Asaas...');

    const customerResponse = await fetch(`${ASAAS_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: customerName,
        cpfCnpj: customerCpfCnpj,
        email: customerEmail,
        phone: customerPhone,
        externalReference: orderId,
      }),
    });

    console.log('Customer API response status:', customerResponse.status);
    
    if (!customerResponse.ok) {
      const errorText = await customerResponse.text();
      console.error('Customer API error response:', errorText);
      throw new Error(`Asaas customer API error: ${customerResponse.status} - ${errorText}`);
    }

    const customerData = await customerResponse.json();
    console.log('Customer response:', customerData);

    let customerId = customerData.id;

    // If customer already exists, get their ID
    if (customerData.errors && customerData.errors[0]?.code === 'already_exists') {
      console.log('Customer already exists, searching...');
      const searchResponse = await fetch(`${ASAAS_BASE_URL}/customers?cpfCnpj=${customerCpfCnpj}`, {
        headers: {
          'access_token': ASAAS_API_KEY!,
        },
      });
      
      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Customer search API error:', errorText);
        throw new Error(`Asaas customer search error: ${searchResponse.status} - ${errorText}`);
      }
      
      const searchData = await searchResponse.json();
      customerId = searchData.data[0]?.id;
    }

    if (!customerId) {
      throw new Error('Failed to create or find customer in Asaas');
    }

    console.log('Customer ID:', customerId);

    // Create boleto payment in Asaas
    console.log('Creating boleto payment...');
    const paymentResponse = await fetch(`${ASAAS_BASE_URL}/payments`, {
      method: 'POST',
      headers: {
        'access_token': ASAAS_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: customerId,
        billingType: 'BOLETO',
        value: amount,
        dueDate: dueDate,
        description: description,
        externalReference: orderId,
        postalService: false,
      }),
    });

    console.log('Payment API response status:', paymentResponse.status);
    
    if (!paymentResponse.ok) {
      const errorText = await paymentResponse.text();
      console.error('Payment API error response:', errorText);
      throw new Error(`Asaas payment API error: ${paymentResponse.status} - ${errorText}`);
    }

    const paymentData = await paymentResponse.json();
    console.log('Payment created:', paymentData);

    if (paymentData.errors) {
      throw new Error(`Asaas payment error: ${JSON.stringify(paymentData.errors)}`);
    }

    // Update order with boleto information
    console.log('Updating order with boleto info...');
    const { error: updateError } = await supabaseAdmin
      .from('orders')
      .update({
        external_id: paymentData.id,
        boleto_url: paymentData.bankSlipUrl,
        boleto_barcode: paymentData.nossoNumero,
        boleto_line: paymentData.digitableLine,
        status: 'boleto_generated',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order:', updateError);
      throw new Error(`Failed to update order: ${updateError.message}`);
    }

    console.log('Boleto created successfully');

    return new Response(JSON.stringify({
      success: true,
      boleto: {
        boletoUrl: paymentData.bankSlipUrl,
        digitableLine: paymentData.digitableLine,
        barcode: paymentData.nossoNumero,
        dueDate: paymentData.dueDate,
        value: paymentData.value,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error in create-boleto function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.stack 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});