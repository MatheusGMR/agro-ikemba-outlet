import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log('🔍 [expire-reservations] Verificando reservas expiradas...');

    const { data, error } = await supabase.rpc('expire_inventory_reservations');

    if (error) {
      console.error('❌ [expire-reservations] Erro ao expirar reservas:', error);
      throw error;
    }

    console.log(`✅ [expire-reservations] ${data} reservas expiradas com sucesso`);

    return new Response(
      JSON.stringify({
        success: true,
        expired_count: data,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('❌ [expire-reservations] Erro na função:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
