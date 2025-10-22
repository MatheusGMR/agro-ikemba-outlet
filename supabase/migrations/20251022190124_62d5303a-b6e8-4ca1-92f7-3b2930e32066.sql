-- ===== MIGRATION: Simplificar Inventário e Remover Colunas de Comissão =====

-- 1. Dropar view primeiro (será recriada depois)
DROP VIEW IF EXISTS inventory_available CASCADE;

-- 2. Remover colunas de comissão não utilizadas
ALTER TABLE inventory
  DROP COLUMN IF EXISTS net_commission,
  DROP COLUMN IF EXISTS commission_percentage,
  DROP COLUMN IF EXISTS rep_percentage,
  DROP COLUMN IF EXISTS supplier_net;

-- 3. Renomear volume_available para total_volume (clareza semântica)
ALTER TABLE inventory
  RENAME COLUMN volume_available TO total_volume;

-- 4. Adicionar comentário na coluna commission_unit
COMMENT ON COLUMN inventory.commission_unit IS 
  'DEPRECATED - Manter por compatibilidade. Calcular dinamicamente no código como 1.5% * preco_afiliado';

-- 5. Recriar view inventory_available com campos corretos
CREATE VIEW inventory_available AS
SELECT 
  i.id,
  i.product_sku,
  i.product_name,
  i.manufacturer,
  i.active_ingredient,
  i.mapa_number,
  i.packaging,
  i.unit,
  i.state,
  i.city,
  i.expiry_date,
  i.base_price,
  i.preco_afiliado,
  i.preco_banda_menor,
  i.preco_banda_maior,
  i.commission_unit,
  i.created_at,
  i.updated_at,
  i.total_volume,
  COALESCE(SUM(r.reserved_volume), 0) as reserved_volume,
  i.total_volume - COALESCE(SUM(r.reserved_volume), 0) as available_volume
FROM inventory i
LEFT JOIN inventory_reservations r 
  ON i.id = r.inventory_item_id 
  AND r.status = 'active'
  AND r.expires_at > NOW()
WHERE i.expiry_date >= CURRENT_DATE
GROUP BY i.id;