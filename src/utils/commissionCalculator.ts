/**
 * Utility para cálculo de comissões e ganhos do representante
 * 
 * REGRAS DE NEGÓCIO:
 * - Comissão fixa: 1.5% do preço BASE (preco_afiliado SEM overprice)
 * - Ganho overprice: 100% do overprice aplicado
 * - Ganho total: comissão fixa + ganho overprice
 */

export interface CommissionCalculation {
  commission_fixed: number;      // Comissão fixa (1.5% do preço final)
  overprice_gain: number;        // Ganho do overprice (100% do overprice)
  total_gain: number;            // Ganho total (comissão + overprice)
  final_price: number;           // Preço final ao cliente
  base_price: number;            // Preço base (preco_afiliado)
}

/**
 * Calcula ganhos do representante para um produto
 * @param preco_afiliado Preço afiliado do produto (base sem overprice)
 * @param overprice_amount Valor do overprice adicionado pelo representante
 * @param volume Volume em litros (padrão: 1)
 * @returns Cálculo detalhado de comissões
 */
export function calculateRepresentativeGain(
  preco_afiliado: number,
  overprice_amount: number = 0,
  volume: number = 1
): CommissionCalculation {
  const COMMISSION_RATE = 0.015; // 1.5%
  
  const final_price = preco_afiliado + overprice_amount;
  const commission_fixed = preco_afiliado * COMMISSION_RATE; // Calcula APENAS sobre preço base
  const overprice_gain = overprice_amount; // 100% do overprice
  const total_gain = commission_fixed + overprice_gain;
  
  return {
    commission_fixed: commission_fixed * volume,
    overprice_gain: overprice_gain * volume,
    total_gain: total_gain * volume,
    final_price,
    base_price: preco_afiliado
  };
}

/**
 * Calcula apenas a comissão fixa (sem overprice)
 * Útil para calcular ganho mínimo potencial
 */
export function calculateFixedCommission(
  preco_final: number,
  volume: number = 1
): number {
  const COMMISSION_RATE = 0.015; // 1.5%
  return preco_final * COMMISSION_RATE * volume;
}

/**
 * Formata valores monetários em BRL
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}
