import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem, ProductDocument, ProductWithInventory, PriceTierBenefit } from '@/types/inventory';

export class InventoryService {
  static async getInventoryBySku(sku: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_sku', sku)
      .order('price_tier', { ascending: true });

    if (error) {
      console.error('Error fetching inventory:', error);
      throw error;
    }

    return (data || []) as InventoryItem[];
  }

  static async getAllInventory(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('product_name', { ascending: true });

    if (error) {
      console.error('Error fetching all inventory:', error);
      throw error;
    }

    return (data || []) as InventoryItem[];
  }

  static async getProductDocuments(sku: string): Promise<ProductDocument[]> {
    const { data, error } = await supabase
      .from('product_documents')
      .select('*')
      .eq('product_sku', sku);

    if (error) {
      console.error('Error fetching product documents:', error);
      throw error;
    }

    return (data || []) as ProductDocument[];
  }

  static async getProductsWithInventory(): Promise<ProductWithInventory[]> {
    const inventory = await this.getAllInventory();
    const productMap = new Map<string, ProductWithInventory>();

    for (const item of inventory) {
      if (!productMap.has(item.product_sku)) {
        const documents = await this.getProductDocuments(item.product_sku);
        
        productMap.set(item.product_sku, {
          sku: item.product_sku,
          name: item.product_name,
          manufacturer: item.manufacturer,
          active_ingredient: item.active_ingredient,
          total_volume: 0,
          locations: [],
          price_tiers: [],
          documents,
          expiry_date: item.expiry_date
        });
      }

      const product = productMap.get(item.product_sku)!;
      
      // Add to total volume
      product.total_volume += item.volume_available;
      
      // Add location if not exists
      const locationExists = product.locations.find(
        loc => loc.state === item.state && loc.city === item.city
      );
      
      if (!locationExists) {
        product.locations.push({
          state: item.state,
          city: item.city,
          volume: item.volume_available
        });
      } else {
        locationExists.volume += item.volume_available;
      }
      
      // Add price tier if not exists
      const tierExists = product.price_tiers.find(tier => tier.tier === item.price_tier);
      if (!tierExists) {
        product.price_tiers.push({
          tier: item.price_tier,
          price: item.client_price
        });
      }
    }

    return Array.from(productMap.values());
  }

  static calculatePriceBenefits(inventory: InventoryItem[]): PriceTierBenefit[] {
    if (inventory.length === 0) return [];

    // Group by price tier and get the best price for each tier
    const tierMap = new Map<string, number>();
    inventory.forEach(item => {
      const currentPrice = tierMap.get(item.price_tier);
      if (!currentPrice || item.client_price < currentPrice) {
        tierMap.set(item.price_tier, item.client_price);
      }
    });

    const tiers = Array.from(tierMap.entries()).map(([tier, price]) => ({ tier, price }));
    tiers.sort((a, b) => b.price - a.price); // Sort by price descending

    const highestPrice = tiers[0]?.price || 0;

    return tiers.map((tier, index) => ({
      tier: tier.tier as any,
      price: tier.price,
      savings: highestPrice - tier.price,
      savings_percentage: highestPrice > 0 ? ((highestPrice - tier.price) / highestPrice) * 100 : 0,
      volume_required: index === 0 ? undefined : 1000 // Example threshold
    }));
  }

  static getTotalVolumeAvailable(): Promise<number> {
    return this.getAllInventory().then(inventory => 
      inventory.reduce((total, item) => total + item.volume_available, 0)
    );
  }

  static getAvailableProducts(): Promise<string[]> {
    return this.getAllInventory().then(inventory => 
      [...new Set(inventory.map(item => item.product_sku))]
    );
  }
}