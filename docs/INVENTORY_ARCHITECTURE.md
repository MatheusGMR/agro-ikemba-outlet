# Arquitetura de Inventário - AgroIkemba

## 🎯 Regra de Ouro

**LEITURA**: Use sempre `inventory_available` (view)  
**ESCRITA**: Use sempre `inventory` (tabela)

## 📊 Estrutura de Dados

### Tabela `inventory` (Escrita)
- Armazena estoque físico
- Campo principal: `total_volume` (volume total em estoque)
- Usar para INSERT, UPDATE, DELETE

### View `inventory_available` (Leitura)
- Calcula volumes em tempo real
- Campos derivados:
  - `total_volume`: Volume total
  - `reserved_volume`: Volume reservado em propostas ativas
  - `available_volume`: Volume disponível (total - reserved)

## 🔧 Uso no Código

### ✅ CORRETO
```typescript
// Ler dados
const { data } = await supabase
  .from('inventory_available')
  .select('*')
  .gt('available_volume', 0);

// Escrever dados
await supabase
  .from('inventory')
  .insert({ total_volume: 1000, ... });
```

### ❌ INCORRETO
```typescript
// Nunca ler da tabela direta
const { data } = await supabase
  .from('inventory')  // ❌ Não usa reservas
  .select('*');
```

## 📝 Campos de Volume

| Campo | Origem | Descrição |
|-------|--------|-----------|
| `total_volume` | Tabela | Volume total em estoque |
| `reserved_volume` | Calculado | Volume em propostas ativas |
| `available_volume` | Calculado | Volume disponível para venda |

## 🔄 Fluxo de Cancelamento de Propostas

### Cancelamento Automático via Trigger

Quando uma proposta tem seu status alterado para `rejected` ou `cancelled`:

1. **Trigger `trigger_auto_cancel_reservations`** é acionado automaticamente
2. Todas as reservas ativas (`status = 'active'`) da proposta são canceladas
3. Campo `reservation_status` da proposta é atualizado para `'cancelled'`
4. Volume é **liberado imediatamente** e volta a aparecer como disponível

### Cancelamento via Edge Function

A edge function `reject-proposal`:
- Atualiza `proposals.status` para `'rejected'`
- Trigger cancela as reservas automaticamente
- RPC `cancel_inventory_reservation` é chamado como backup
- Notificação é criada para o representante

### Políticas de Expiração

- **Reservas ativas**: Expiram após 48 horas automaticamente
- **Propostas enviadas**: Sem expiração automática, devem ser aprovadas/rejeitadas pelo cliente
- **Volume liberado**: Fica disponível imediatamente após cancelamento

### Como Cancelar Manualmente (SQL)

```sql
-- Cancelar uma proposta específica
SELECT cancel_inventory_reservation('proposal-uuid');

-- Verificar volumes liberados
SELECT product_sku, total_volume, reserved_volume, available_volume 
FROM inventory_available 
WHERE product_sku = 'SKU';
```

### Sincronização de Status

| Ação | `proposals.status` | `inventory_reservations.status` | Volume Disponível |
|------|-------------------|--------------------------------|-------------------|
| Criar proposta | `draft` | `active` | ⬇️ Reduz |
| Enviar proposta | `sent` | `active` | ⬇️ Mantém reduzido |
| Aprovar | `approved` | `consumed` | ⬇️ Mantém reduzido |
| Rejeitar | `rejected` | `cancelled` | ⬆️ Libera |
| Cancelar | `cancelled` | `cancelled` | ⬆️ Libera |
| Expirar (48h) | `sent` | `expired` | ⬆️ Libera |
