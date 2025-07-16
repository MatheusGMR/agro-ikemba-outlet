import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimulationData {
  inputId: string;
  simulationName: string;
  purchaseCost: number;
  operationalExpenses: number;
  taxesPercentage: number;
  commissionsPercentage: number;
  targetMarginPercentage: number;
  region: string;
  commodityName: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);

    const data: SimulationData = await req.json();

    console.log('Processing simulation calculation for:', data.simulationName);

    // 1. Calcular preço de venda baseado nos custos
    const totalTaxesCommissions = data.taxesPercentage + data.commissionsPercentage;
    const grossRevenue = (data.purchaseCost + data.operationalExpenses) * (1 + data.targetMarginPercentage / 100);
    const calculatedPrice = grossRevenue / (1 - totalTaxesCommissions / 100);

    // 2. Buscar dados de mercado para comparação
    const { data: marketPrices } = await supabase
      .from('market_prices')
      .select('*')
      .eq('input_id', data.inputId)
      .eq('region', data.region)
      .order('date', { ascending: false })
      .limit(10);

    // 3. Buscar preços de commodities
    const { data: commodityPrices } = await supabase
      .from('commodity_prices')
      .select('*')
      .eq('commodity_name', data.commodityName)
      .eq('region', data.region)
      .order('date', { ascending: false })
      .limit(1);

    const commodityPrice = commodityPrices?.[0]?.price || 0;

    // 4. Calcular médias de preços de mercado por fonte
    const regionalPrice = marketPrices
      ?.filter(p => p.source === 'regional')
      ?.reduce((acc, p) => acc + p.price, 0) / 
      (marketPrices?.filter(p => p.source === 'regional')?.length || 1) || 0;

    const quotationPrice = marketPrices
      ?.filter(p => p.source === 'quotation')
      ?.reduce((acc, p) => acc + p.price, 0) / 
      (marketPrices?.filter(p => p.source === 'quotation')?.length || 1) || 0;

    const historicalPrice = marketPrices
      ?.filter(p => p.source === 'historical')
      ?.reduce((acc, p) => acc + p.price, 0) / 
      (marketPrices?.filter(p => p.source === 'historical')?.length || 1) || 0;

    // 5. Calcular métricas de análise
    const marketPositioningPercentage = regionalPrice > 0 
      ? ((calculatedPrice / regionalPrice) - 1) * 100 
      : 0;

    const competitiveDifference = quotationPrice > 0 
      ? calculatedPrice - quotationPrice 
      : 0;

    // Calcular margem de mercado (qual seria a margem se vendesse ao preço regional)
    let marketMarginPercentage = 0;
    if (regionalPrice > 0) {
      const marketRevenue = regionalPrice / (1 + totalTaxesCommissions / 100);
      const totalCost = data.purchaseCost + data.operationalExpenses;
      marketMarginPercentage = ((marketRevenue - totalCost) / totalCost) * 100;
    }

    // Calcular relação de troca
    const tradeRelationSimulated = commodityPrice > 0 
      ? calculatedPrice / commodityPrice 
      : 0;

    const tradeRelationMarket = (commodityPrice > 0 && regionalPrice > 0) 
      ? regionalPrice / commodityPrice 
      : 0;

    // 6. Salvar simulação no banco
    const { data: simulation, error } = await supabase
      .from('price_simulations')
      .insert({
        user_id: user?.id || null,
        input_id: data.inputId,
        simulation_name: data.simulationName,
        purchase_cost: data.purchaseCost,
        operational_expenses: data.operationalExpenses,
        taxes_percentage: data.taxesPercentage,
        commissions_percentage: data.commissionsPercentage,
        target_margin_percentage: data.targetMarginPercentage,
        calculated_price: calculatedPrice,
        regional_market_price: regionalPrice,
        quotation_price: quotationPrice,
        historical_average_price: historicalPrice,
        commodity_price: commodityPrice,
        commodity_name: data.commodityName,
        market_positioning_percentage: marketPositioningPercentage,
        competitive_difference: competitiveDifference,
        market_margin_percentage: marketMarginPercentage,
        trade_relation_simulated: tradeRelationSimulated,
        trade_relation_market: tradeRelationMarket,
        region: data.region,
        notes: data.notes
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving simulation:', error);
      throw error;
    }

    console.log('Simulation calculated and saved:', simulation.id);

    return new Response(JSON.stringify({
      success: true,
      simulation: {
        id: simulation.id,
        calculatedPrice,
        marketMetrics: {
          regionalPrice,
          quotationPrice,
          historicalPrice,
          commodityPrice,
          marketPositioningPercentage,
          competitiveDifference,
          marketMarginPercentage,
          tradeRelationSimulated,
          tradeRelationMarket
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-simulation:', error);
    return new Response(JSON.stringify({ 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});