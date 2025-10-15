export interface InventoryItem {
  id: string;
  product_sku: string;
  product_name: string;
  manufacturer: string;
  active_ingredient?: string;
  mapa_number?: string;
  packaging: string;
  volume_available: number;
  unit: string;
  state: string;
  city: string;
  expiry_date: string;
  base_price: number;
  preco_banda_menor: number;
  preco_banda_maior: number;
  commission_unit?: number;
  net_commission?: number;
  commission_percentage?: number;
  rep_percentage?: number;
  supplier_net?: number;
  created_at: string;
  updated_at: string;
  // Campos adicionados pela view inventory_available
  total_volume?: number;
  reserved_volume?: number;
  available_volume?: number;
}

export interface ProductDocument {
  id: string;
  product_sku: string;
  document_type: 'bula' | 'fisqp' | 'fds' | 'ficha_emergencia' | 'adapar';
  document_name: string;
  document_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProductWithInventory {
  sku: string;
  name: string;
  manufacturer: string;
  active_ingredient?: string;
  total_volume: number;
  locations: Array<{
    state: string;
    city: string;
    volume: number;
  }>;
  price_tiers: Array<{
    tier: string;
    price: number;
    min_volume?: number;
  }>;
  documents: ProductDocument[];
  expiry_date: string;
}

export interface PriceTierBenefit {
  tier: 'Preço Unitário' | 'Preço Banda menor' | 'Preço Banda maior';
  price: number;
  savings: number;
  savings_percentage: number;
  volume_required?: number;
}

// Nova interface para produtos agrupados para vendas
export interface GroupedProduct {
  sku: string;
  name: string;
  manufacturer: string;
  active_ingredient?: string;
  main_item: InventoryItem; // Item com preço unitário
  total_volume: number;
  locations_count: number;
  all_items: InventoryItem[]; // Todos os itens (incluindo bandas de preço)
}