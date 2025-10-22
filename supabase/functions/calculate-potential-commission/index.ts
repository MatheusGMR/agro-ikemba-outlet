import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InventoryItem {
  id: string;
  product_sku: string;
  product_name: string;
  available_volume: number;
  preco_afiliado: number;
  state: string;
  city: string;
}

interface PotentialCommissionResult {
  total_potential_commission: number;
  total_volume_available: number;
  products_count: number;
  commission_breakdown: {
    product_sku: string;
    product_name: string;
    volume_available: number;
    commission_per_unit: number;
    total_commission: number;
    locations: string[];
  }[];
}

export default async function handler(req: Request) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting potential commission calculation...');

    // Get all inventory items that are not expired
    const today = new Date().toISOString().split('T')[0];
    
    const { data: inventoryItems, error: inventoryError } = await supabase
      .from('inventory_available')
      .select(`
        id,
        product_sku,
        product_name,
        available_volume,
        preco_afiliado,
        state,
        city
      `)
      .gt('available_volume', 0);

    if (inventoryError) {
      console.error('Error fetching inventory:', inventoryError);
      throw inventoryError;
    }

    if (!inventoryItems || inventoryItems.length === 0) {
      console.log('No inventory items found');
      return new Response(
        JSON.stringify({
          total_potential_commission: 0,
          total_volume_available: 0,
          products_count: 0,
          commission_breakdown: []
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Found ${inventoryItems.length} inventory items`);

    // Group by product SKU to calculate potential commission per product
    const productGroups = new Map<string, {
      product_name: string;
      total_volume: number;
      preco_afiliado: number;
      locations: Set<string>;
    }>();

    let totalPotentialCommission = 0;
    let totalVolumeAvailable = 0;

    const COMMISSION_RATE = 0.015; // 1.5%

    for (const item of inventoryItems as InventoryItem[]) {
      const locationKey = `${item.city}, ${item.state}`;
      
      if (!productGroups.has(item.product_sku)) {
        productGroups.set(item.product_sku, {
          product_name: item.product_name,
          total_volume: 0,
          preco_afiliado: item.preco_afiliado,
          locations: new Set()
        });
      }

      const group = productGroups.get(item.product_sku)!;
      group.total_volume += item.available_volume;
      group.locations.add(locationKey);

      // Calculate potential commission dynamically: 1.5% of preco_afiliado
      const commission_per_unit = item.preco_afiliado * COMMISSION_RATE;
      const itemPotentialCommission = item.available_volume * commission_per_unit;
      totalPotentialCommission += itemPotentialCommission;
      totalVolumeAvailable += item.available_volume;

      console.log(`Product ${item.product_sku}: ${item.available_volume}L × R$${commission_per_unit.toFixed(2)} = R$${itemPotentialCommission.toFixed(2)}`);
    }

    // Create breakdown for response
    const commissionBreakdown = Array.from(productGroups.entries()).map(([sku, group]) => {
      const commission_per_unit = group.preco_afiliado * COMMISSION_RATE;
      return {
        product_sku: sku,
        product_name: group.product_name,
        volume_available: group.total_volume,
        commission_per_unit,
        total_commission: group.total_volume * commission_per_unit,
        locations: Array.from(group.locations)
      };
    });

    // Sort by total commission descending
    commissionBreakdown.sort((a, b) => b.total_commission - a.total_commission);

    const result: PotentialCommissionResult = {
      total_potential_commission: totalPotentialCommission,
      total_volume_available: totalVolumeAvailable,
      products_count: productGroups.size,
      commission_breakdown: commissionBreakdown
    };

    console.log(`Total potential commission: R$${totalPotentialCommission.toFixed(2)}`);
    console.log(`Total volume available: ${totalVolumeAvailable}L`);
    console.log(`Products count: ${productGroups.size}`);

    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in calculate-potential-commission function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to calculate potential commission',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}