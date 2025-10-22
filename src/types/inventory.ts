export interface InventoryItem {
  id: string;
  product_sku: string;
  product_name: string;
  manufacturer: string;
  active_ingredient?: string;
  mapa_number?: string;
  packaging: string;
  unit: string;
  state: string;
  city: string;
  expiry_date: string;
  base_price: number;
  preco_afiliado?: number;
  preco_banda_menor: number;
  preco_banda_maior: number;
  created_at: string;
  updated_at: string;
  
  // VOLUME FIELDS - Sempre da view inventory_available
  total_volume: number;        // Volume total em estoque (ex-volume_available)
  reserved_volume: number;     // Volume reservado em propostas ativas
  available_volume: number;    // Volume disponível = total - reserved
  
  // COMMISSION FIELD - DEPRECATED
  /**
   * @deprecated Não usar! Calcular dinamicamente no código.
   * Manter apenas por compatibilidade com dados antigos.
   */
  commission_unit?: number;
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