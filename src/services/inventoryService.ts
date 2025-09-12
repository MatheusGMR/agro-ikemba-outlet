import { supabase } from '@/integrations/supabase/client';
import type { InventoryItem, ProductDocument, ProductWithInventory, PriceTierBenefit, GroupedProduct } from '@/types/inventory';

export class InventoryService {
  static async getInventoryBySku(sku: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('product_sku', sku)
      .order('product_name', { ascending: true });

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
    try {
      // Single query to get all inventory
      const inventory = await this.getAllInventory();
      
      if (!inventory || inventory.length === 0) {
        return [];
      }

      // Get all unique SKUs for documents query
      const skus = [...new Set(inventory.map(item => item.product_sku))];
      
      // Single query to get all documents for all products
      const { data: documents, error: documentsError } = await supabase
        .from('product_documents')
        .select('*')
        .in('product_sku', skus);

      if (documentsError) {
        console.warn('Error fetching product documents:', documentsError);
      }

      // Group documents by SKU for easy lookup
      const documentsBySku = new Map<string, ProductDocument[]>();
      if (documents) {
        documents.forEach(doc => {
          if (!documentsBySku.has(doc.product_sku)) {
            documentsBySku.set(doc.product_sku, []);
          }
          documentsBySku.get(doc.product_sku)!.push(doc as ProductDocument);
        });
      }

      const productMap = new Map<string, ProductWithInventory>();

      for (const item of inventory) {
        if (!productMap.has(item.product_sku)) {
          productMap.set(item.product_sku, {
            sku: item.product_sku,
            name: item.product_name,
            manufacturer: item.manufacturer,
            active_ingredient: item.active_ingredient,
            total_volume: 0,
            locations: [],
            price_tiers: [
              { tier: 'Preço Unitário', price: item.preco_unitario },
              { tier: 'Preço Banda menor', price: item.preco_banda_menor },
              { tier: 'Preço Banda maior', price: item.preco_banda_maior }
            ],
            documents: documentsBySku.get(item.product_sku) || [],
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
      }

      return Array.from(productMap.values());
    } catch (error) {
      console.error('Error in getProductsWithInventory:', error);
      throw error;
    }
  }

  // Nova função para agrupar produtos mostrando apenas preço unitário
  static async getGroupedProductsForSales(): Promise<GroupedProduct[]> {
    const inventory = await this.getAllInventory();
    const productMap = new Map<string, GroupedProduct>();

    for (const item of inventory) {
      const key = item.product_sku;
      
      if (!productMap.has(key)) {
        productMap.set(key, {
          sku: item.product_sku,
          name: item.product_name,
          manufacturer: item.manufacturer,
          active_ingredient: item.active_ingredient,
          main_item: item, // Use current item as main item
          total_volume: 0,
          locations_count: 0,
          all_items: inventory.filter(inv => inv.product_sku === item.product_sku)
        });
      }
    }

    // Calculate total volume and unique locations count
    for (const product of productMap.values()) {
      const uniqueLocationVolumes = new Map<string, number>();
      
      // Group by unique physical location and sum volumes
      for (const item of product.all_items) {
        const locationKey = `${item.city}-${item.state}`;
        if (!uniqueLocationVolumes.has(locationKey)) {
          uniqueLocationVolumes.set(locationKey, item.volume_available);
        }
      }
      
      // Sum unique volumes by location
      product.total_volume = Array.from(uniqueLocationVolumes.values()).reduce((sum, vol) => sum + vol, 0);
      product.locations_count = uniqueLocationVolumes.size;
    }

    return Array.from(productMap.values());
  }

  static calculatePriceBenefits(inventory: InventoryItem[]): PriceTierBenefit[] {
    if (inventory.length === 0) return [];

    const firstItem = inventory[0];
    
    const benefits: PriceTierBenefit[] = [
      {
        tier: 'Preço Unitário',
        price: firstItem.preco_unitario,
        savings: 0,
        savings_percentage: 0
      },
      {
        tier: 'Preço Banda menor',
        price: firstItem.preco_banda_menor,
        savings: firstItem.preco_unitario - firstItem.preco_banda_menor,
        savings_percentage: ((firstItem.preco_unitario - firstItem.preco_banda_menor) / firstItem.preco_unitario) * 100
      },
      {
        tier: 'Preço Banda maior',
        price: firstItem.preco_banda_maior,
        savings: firstItem.preco_unitario - firstItem.preco_banda_maior,
        savings_percentage: ((firstItem.preco_unitario - firstItem.preco_banda_maior) / firstItem.preco_unitario) * 100
      }
    ];

    return benefits;
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