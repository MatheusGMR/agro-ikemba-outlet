# Arquitetura de Comissões - AgroIkemba

## 📊 Regras de Negócio

### Comissão Fixa
- **Taxa**: 1.5% do preço final
- **Preço final**: `preco_afiliado + overprice`
- **Cálculo**: `(preco_afiliado + overprice) * 0.015 * volume`

### Ganho Overprice
- **Taxa**: 100% do overprice
- **Cálculo**: `overprice * volume`

### Ganho Total
- **Fórmula**: `comissão_fixa + ganho_overprice`

## 🛠️ Implementação

### Utility Centralizada
Toda lógica em `src/utils/commissionCalculator.ts`:

```typescript
import { calculateRepresentativeGain } from '@/utils/commissionCalculator';

const calculation = calculateRepresentativeGain(
  preco_afiliado,
  overprice_amount,
  volume
);

// Retorna:
// - commission_fixed
// - overprice_gain
// - total_gain
// - final_price
```

### ❌ Campo Deprecado
`inventory.commission_unit` está **DEPRECADO**:
- Manter apenas por compatibilidade
- **Nunca usar** no código novo
- Calcular sempre dinamicamente
