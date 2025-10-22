-- Adicionar novos lotes do produto SKU 10867 (VENTURE MAX)
-- Opção A: Adicionar aos lotes existentes

-- 1. Adicionar novo lote em CUIABÁ-MT (13.000L)
INSERT INTO inventory (
  product_sku,
  product_name,
  manufacturer,
  active_ingredient,
  mapa_number,
  packaging,
  unit,
  state,
  city,
  total_volume,
  base_price,
  preco_afiliado,
  preco_banda_menor,
  preco_banda_maior,
  expiry_date
) VALUES (
  '10867',
  'VENTURE MAX',
  'Alta Defensivos',
  'HALOXIFOPE',
  '31222',
  'Galão',
  'L',
  'MT',
  'CUIABÁ',
  13000,
  115.00,
  115.00,
  116.00,
  117.00,
  '2026-12-11'
);

-- 2. Adicionar novo lote em UBERABA-MG (50.000L adicional)
INSERT INTO inventory (
  product_sku,
  product_name,
  manufacturer,
  active_ingredient,
  mapa_number,
  packaging,
  unit,
  state,
  city,
  total_volume,
  base_price,
  preco_afiliado,
  preco_banda_menor,
  preco_banda_maior,
  expiry_date
) VALUES (
  '10867',
  'VENTURE MAX',
  'Alta Defensivos',
  'HALOXIFOPE',
  '31222',
  'Galão',
  'L',
  'MG',
  'UBERABA',
  50000,
  115.00,
  115.00,
  116.00,
  117.00,
  '2026-12-11'
);