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
