
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

// Função para gerar hierarquia de regiões
function generateRegionHierarchy(region: string): string[] {
  const hierarchy = [region];
  
  // Se região é específica (ex: SP-01), adicionar região geral (SP)
  if (region.includes('-')) {
    const generalRegion = region.split('-')[0];
    hierarchy.push(generalRegion);
  }
  
  // Sempre adicionar BR como fallback final
  if (region !== 'BR') {
    hierarchy.push('BR');
  }
  
  console.log(`Hierarquia de regiões para ${region}:`, hierarchy);
  return hierarchy;
}

// Função para buscar preços de mercado com fallback hierárquico
async function fetchMarketPricesWithFallback(supabase: any, inputId: string, region: string) {
  const regionHierarchy = generateRegionHierarchy(region);
  
  for (const searchRegion of regionHierarchy) {
    console.log(`Buscando preços de mercado para input ${inputId} na região ${searchRegion}...`);
    
    const { data: marketPrices } = await supabase
      .from('market_prices')
      .select('*')
      .eq('input_id', inputId)
      .eq('region', searchRegion)
      .order('date', { ascending: false })
      .limit(10);

    if (marketPrices && marketPrices.length > 0) {
      console.log(`Encontrados ${marketPrices.length} preços de mercado para região ${searchRegion}`);
      return marketPrices;
    }
  }
  
  console.log(`Nenhum preço de mercado encontrado para input ${inputId} em nenhuma região da hierarquia`);
  return [];
}

// Função para buscar preços de commodities com fallback hierárquico
async function fetchCommodityPricesWithFallback(supabase: any, commodityName: string, region: string) {
  const regionHierarchy = generateRegionHierarchy(region);
  
  for (const searchRegion of regionHierarchy) {
    console.log(`Buscando preços de commodity ${commodityName} na região ${searchRegion}...`);
    
    const { data: commodityPrices } = await supabase
      .from('commodity_prices')
      .select('*')
      .eq('commodity_name', commodityName)
      .eq('region', searchRegion)
      .order('date', { ascending: false })
      .limit(1);

    if (commodityPrices && commodityPrices.length > 0) {
      console.log(`Encontrado preço de commodity ${commodityName} para região ${searchRegion}: ${commodityPrices[0].price}`);
      return commodityPrices[0];
    }
  }
  
  console.log(`Nenhum preço de commodity ${commodityName} encontrado em nenhuma região da hierarquia`);
  return null;
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

    console.log('=== INICIANDO SIMULAÇÃO ===');
    console.log('Nome da simulação:', data.simulationName);
    console.log('Região solicitada:', data.region);
    console.log('Commodity:', data.commodityName);

    // 1. Calcular preço de venda baseado nos custos
    const totalTaxesCommissions = data.taxesPercentage + data.commissionsPercentage;
    const grossRevenue = (data.purchaseCost + data.operationalExpenses) * (1 + data.targetMarginPercentage / 100);
    const calculatedPrice = grossRevenue / (1 - totalTaxesCommissions / 100);
    
    console.log('Preço calculado:', calculatedPrice);

    // 2. Buscar dados de mercado com fallback hierárquico
    const marketPrices = await fetchMarketPricesWithFallback(supabase, data.inputId, data.region);

    // 3. Buscar preços de commodities com fallback hierárquico
    const commodityPrice = await fetchCommodityPricesWithFallback(supabase, data.commodityName, data.region);
    const commodityPriceValue = commodityPrice?.price || 0;

    console.log('Preço da commodity encontrado:', commodityPriceValue);

    // 4. Processar preços de mercado por fonte
    const regionalPrices = marketPrices.filter((p: any) => p.source === 'regional');
    const quotationPrices = marketPrices.filter((p: any) => p.source === 'quotation');
    const internationalPrices = marketPrices.filter((p: any) => p.source === 'international');
    
    const regionalPrice = regionalPrices.length > 0 
      ? regionalPrices.reduce((acc: number, p: any) => acc + p.price, 0) / regionalPrices.length
      : 0;

    const quotationPrice = quotationPrices.length > 0 
      ? quotationPrices.reduce((acc: number, p: any) => acc + p.price, 0) / quotationPrices.length
      : 0;

    const internationalPrice = internationalPrices.length > 0 
      ? internationalPrices.reduce((acc: number, p: any) => acc + p.price, 0) / internationalPrices.length
      : 0;

    // Calcular preço histórico médio
    const historicalPrice = marketPrices.length > 0 
      ? marketPrices.reduce((acc: number, p: any) => acc + p.price, 0) / marketPrices.length
      : 0;

    console.log('=== PREÇOS ENCONTRADOS ===');
    console.log('Regional:', regionalPrice);
    console.log('Cotação:', quotationPrice);
    console.log('Internacional:', internationalPrice);
    console.log('Histórico:', historicalPrice);

    // 5. Calcular métricas de análise com fallbacks inteligentes
    let marketPositioningPercentage = 0;
    let referencePrice = 0;
    
    // Prioridade: Regional > Cotação > Internacional > Histórico
    if (regionalPrice > 0) {
      referencePrice = regionalPrice;
    } else if (quotationPrice > 0) {
      referencePrice = quotationPrice;
    } else if (internationalPrice > 0) {
      referencePrice = internationalPrice;
    } else if (historicalPrice > 0) {
      referencePrice = historicalPrice;
    }
    
    if (referencePrice > 0) {
      marketPositioningPercentage = ((calculatedPrice / referencePrice) - 1) * 100;
    }

    console.log('Preço de referência usado:', referencePrice);
    console.log('Posicionamento de mercado:', marketPositioningPercentage);

    // Diferença competitiva (preferência por cotação, depois regional)
    const competitiveReferencePrice = quotationPrice > 0 ? quotationPrice : referencePrice;
    const competitiveDifference = competitiveReferencePrice > 0 
      ? calculatedPrice - competitiveReferencePrice 
      : 0;

    console.log('Diferença competitiva:', competitiveDifference);

    // 6. Calcular margem de mercado usando o melhor preço disponível
    let marketMarginPercentage = 0;
    const bestMarketPrice = referencePrice;
    
    if (bestMarketPrice > 0) {
      // Calcular receita líquida após impostos e comissões
      const netRevenue = bestMarketPrice * (1 - totalTaxesCommissions / 100);
      const totalCost = data.purchaseCost + data.operationalExpenses;
      
      if (totalCost > 0) {
        marketMarginPercentage = ((netRevenue - totalCost) / totalCost) * 100;
      }
    }

    console.log('Margem de mercado calculada:', marketMarginPercentage);

    // 7. Calcular relação de troca
    let tradeRelationSimulated = 0;
    let tradeRelationMarket = 0;
    
    if (commodityPriceValue > 0) {
      tradeRelationSimulated = calculatedPrice / commodityPriceValue;
      
      if (referencePrice > 0) {
        tradeRelationMarket = referencePrice / commodityPriceValue;
      }
    }

    console.log('Relação de troca simulada:', tradeRelationSimulated);
    console.log('Relação de troca de mercado:', tradeRelationMarket);

    // 8. Salvar simulação no banco
    const simulationRecord = {
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
      commodity_price: commodityPriceValue,
      commodity_name: data.commodityName,
      market_positioning_percentage: marketPositioningPercentage,
      competitive_difference: competitiveDifference,
      market_margin_percentage: marketMarginPercentage,
      trade_relation_simulated: tradeRelationSimulated,
      trade_relation_market: tradeRelationMarket,
      region: data.region,
      notes: data.notes
    };

    const { data: simulation, error } = await supabase
      .from('price_simulations')
      .insert(simulationRecord)
      .select()
      .single();

    if (error) {
      console.error('Erro ao salvar simulação:', error);
      throw error;
    }

    console.log('=== SIMULAÇÃO SALVA COM SUCESSO ===');
    console.log('ID da simulação:', simulation.id);

    return new Response(JSON.stringify({
      success: true,
      simulation: {
        id: simulation.id,
        calculatedPrice,
        marketMetrics: {
          regionalPrice,
          quotationPrice,
          historicalPrice,
          commodityPrice: commodityPriceValue,
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
    console.error('=== ERRO NA SIMULAÇÃO ===', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido na simulação',
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
