export interface FreightCalculation {
  delivery_type: 'retirada' | 'entrega_nacional' | 'entrega_internacional';
  distance_km: number;
  round_trip_km: number;
  freight_rate: number;
  freight_subtotal: number;
  insurance_percentage: number;
  insurance_amount: number;
  total_freight_cost: number;
  freight_per_liter: number;
  cargo_value: number;
  cargo_volume: number;
}

interface FreightConfig {
  delivery_type: 'retirada' | 'entrega_nacional' | 'entrega_internacional';
  distance_km: number;
  cargo_value: number;
  cargo_volume: number;
}

/**
 * Calcula o frete baseado no tipo de entrega e distância
 * 
 * Frete Nacional: R$ 13,00/km + 0,35% seguro
 * Frete Internacional: R$ 15,00/km + 0,45% seguro
 */
export function calculateFreight(config: FreightConfig): FreightCalculation {
  const { delivery_type, distance_km, cargo_value, cargo_volume } = config;
  
  // Retirada não tem custo de frete
  if (delivery_type === 'retirada') {
    return {
      delivery_type: 'retirada',
      distance_km: 0,
      round_trip_km: 0,
      freight_rate: 0,
      freight_subtotal: 0,
      insurance_percentage: 0,
      insurance_amount: 0,
      total_freight_cost: 0,
      freight_per_liter: 0,
      cargo_value,
      cargo_volume
    };
  }
  
  // Configuração por tipo de entrega
  const freight_config = {
    entrega_nacional: { rate: 13, insurance: 0.0035 }, // R$ 13/km + 0,35%
    entrega_internacional: { rate: 15, insurance: 0.0045 } // R$ 15/km + 0,45%
  };
  
  const { rate, insurance } = freight_config[delivery_type];
  
  // Cálculos
  const round_trip_km = distance_km * 2; // Ida + Volta
  const freight_subtotal = round_trip_km * rate;
  const insurance_amount = cargo_value * insurance;
  const total_freight_cost = freight_subtotal + insurance_amount;
  const freight_per_liter = cargo_volume > 0 ? total_freight_cost / cargo_volume : 0;
  
  return {
    delivery_type,
    distance_km,
    round_trip_km,
    freight_rate: rate,
    freight_subtotal,
    insurance_percentage: insurance * 100,
    insurance_amount,
    total_freight_cost,
    freight_per_liter,
    cargo_value,
    cargo_volume
  };
}

/**
 * Formata o tipo de entrega para exibição
 */
export function formatDeliveryType(type: string): string {
  const labels = {
    'retirada': 'Retirada no Local',
    'entrega_nacional': 'Entrega Nacional',
    'entrega_internacional': 'Entrega Internacional'
  };
  return labels[type as keyof typeof labels] || type;
}
