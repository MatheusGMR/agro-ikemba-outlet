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
  price_tier: 'Preço Unitário' | 'Preço Banda menor' | 'Preço Banda maior';
  base_price: number;
  client_price: number;
  commission_unit: number;
  net_commission: number;
  commission_percentage: number;
  rep_percentage: number;
  supplier_net: number;
  created_at: string;
  updated_at: string;
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