import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting market data fetch...');

    // Simular dados de mercado para demonstração
    // Em produção, aqui fariam chamadas para APIs reais (CONAB, IEA/SP, etc.)
    
    const mockMarketData = [
      // Glifosato - Dados regionais
      {
        input_id: null, // será preenchido dinamicamente
        source: 'regional',
        source_name: 'IEA/SP',
        region: 'SP-01',
        price: 118.50,
        unit: 'L',
        date: new Date().toISOString().split('T')[0]
      },
      {
        input_id: null,
        source: 'quotation',
        source_name: 'Agrofy',
        region: 'SP-01',
        price: 115.20,
        unit: 'L',
        date: new Date().toISOString().split('T')[0]
      },
      {
        input_id: null,
        source: 'historical',
        source_name: 'CONAB',
        region: 'SP-01',
        price: 112.80,
        unit: 'L',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    const mockCommodityData = [
      {
        commodity_name: 'soja',
        price: 130.00,
        unit: 'saca',
        source: 'B3',
        region: 'SP-01',
        date: new Date().toISOString().split('T')[0]
      },
      {
        commodity_name: 'milho',
        price: 65.50,
        unit: 'saca',
        source: 'B3',
        region: 'SP-01',
        date: new Date().toISOString().split('T')[0]
      }
    ];

    // Buscar insumos agrícolas para associar aos preços
    const { data: inputs } = await supabase
      .from('agricultural_inputs')
      .select('id, name');

    // Inserir dados de preços de mercado
    for (const input of inputs || []) {
      if (input.name.toLowerCase().includes('glifosato')) {
        for (const marketPrice of mockMarketData) {
          await supabase
            .from('market_prices')
            .upsert({
              ...marketPrice,
              input_id: input.id
            }, {
              onConflict: 'input_id,source,source_name,region,date'
            });
        }
      }
    }

    // Inserir dados de commodities
    for (const commodity of mockCommodityData) {
      await supabase
        .from('commodity_prices')
        .upsert(commodity, {
          onConflict: 'commodity_name,source,region,date'
        });
    }

    console.log('Market data fetch completed successfully');

    return new Response(JSON.stringify({
      success: true,
      message: 'Market data updated successfully',
      inputsUpdated: inputs?.length || 0,
      commoditiesUpdated: mockCommodityData.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in fetch-market-data:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});