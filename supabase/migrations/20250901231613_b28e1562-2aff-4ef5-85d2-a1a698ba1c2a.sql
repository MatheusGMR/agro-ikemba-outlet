-- Inserir produtos da base de estoque fornecida
-- Limpar dados existentes se necessário (opcional)
-- DELETE FROM inventory WHERE manufacturer IN ('Rainbow', 'Alta');

-- Inserir produtos ENTOAR (TEBUTHIURON RAINBOW)
INSERT INTO inventory (
  product_name, product_sku, manufacturer, active_ingredient, mapa_number,
  packaging, unit, volume_available, state, city, price_tier,
  base_price, client_price, supplier_net, commission_percentage, rep_percentage,
  net_commission, commission_unit, expiry_date
) VALUES
('ENTOAR', '6831', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', '7160 Kg', 'Kg', 7160, 'SP', 'BARUERI', 'Preço Unitário', 54.00, 54.00, 52.21, 5.52, 1.50, 2.98, 2.98, '2025-11-30'),
('ENTOAR', '6831', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', '7160 Kg', 'Kg', 7160, 'SP', 'BARUERI', 'Preço Banda menor', 53.83, 53.83, 52.05, 5.52, 1.50, 2.97, 2.97, '2025-11-30'),
('ENTOAR', '6831', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', '7160 Kg', 'Kg', 7160, 'SP', 'BARUERI', 'Preço Banda maior', 55.00, 55.00, 53.18, 5.52, 1.50, 3.04, 3.04, '2025-11-30'),

-- Inserir produtos MAXAPAC 250 EC (TRINEXAPAQUE-ETÍLICO)
('MAXAPAC 250 EC', '11501', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', '15795 Galão', 'L', 15795, 'SP', 'BARUERI', 'Preço Unitário', 88.00, 88.00, 85.09, 5.52, 1.50, 4.86, 4.86, '2026-04-30'),
('MAXAPAC 250 EC', '11501', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', '15795 Galão', 'L', 15795, 'SP', 'BARUERI', 'Preço Banda menor', 86.00, 86.00, 83.15, 5.52, 1.50, 4.75, 4.75, '2026-04-30'),
('MAXAPAC 250 EC', '11501', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', '15795 Galão', 'L', 15795, 'SP', 'BARUERI', 'Preço Banda maior', 90.00, 90.00, 87.02, 5.52, 1.50, 4.97, 4.97, '2026-04-30'),

-- Inserir produtos VENTURE MAX (HALOXIFOPE) - IBIPORÃ PR
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1200 Galão', 'L', 1200, 'PR', 'IBIPORÃ', 'Preço Unitário', 125.00, 125.00, 120.86, 5.52, 1.50, 6.90, 6.90, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1200 Galão', 'L', 1200, 'PR', 'IBIPORÃ', 'Preço Banda menor', 120.00, 120.00, 116.03, 5.52, 1.50, 6.62, 6.62, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1200 Galão', 'L', 1200, 'PR', 'IBIPORÃ', 'Preço Banda maior', 130.00, 130.00, 125.70, 5.52, 1.50, 7.18, 7.18, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1640 Galão', 'L', 1640, 'PR', 'IBIPORÃ', 'Preço Unitário', 125.00, 125.00, 120.86, 5.52, 1.50, 6.90, 6.90, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1640 Galão', 'L', 1640, 'PR', 'IBIPORÃ', 'Preço Banda menor', 120.00, 120.00, 116.03, 5.52, 1.50, 6.62, 6.62, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '1640 Galão', 'L', 1640, 'PR', 'IBIPORÃ', 'Preço Banda maior', 130.00, 130.00, 125.70, 5.52, 1.50, 7.18, 7.18, '2026-08-31'),

-- Inserir produtos VENTURE MAX (HALOXIFOPE) - UBERABA MG
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '800 Galão', 'L', 800, 'MG', 'UBERABA', 'Preço Unitário', 125.00, 125.00, 120.86, 5.52, 1.50, 6.90, 6.90, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '800 Galão', 'L', 800, 'MG', 'UBERABA', 'Preço Banda menor', 120.00, 120.00, 116.03, 5.52, 1.50, 6.62, 6.62, '2026-08-31'),
('VENTURE MAX', '10867', 'Alta', 'HALOXIFOPE', '31222', '800 Galão', 'L', 800, 'MG', 'UBERABA', 'Preço Banda maior', 130.00, 130.00, 125.70, 5.52, 1.50, 7.18, 7.18, '2026-08-31'),

-- Inserir produtos SHIFT (FOMESAFEM) - IBIPORÃ PR - Volume 620
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '620 Galão', 'L', 620, 'PR', 'IBIPORÃ', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '620 Galão', 'L', 620, 'PR', 'IBIPORÃ', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '620 Galão', 'L', 620, 'PR', 'IBIPORÃ', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - BARUERI SP - Volume 8400
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '8400 Galão', 'L', 8400, 'SP', 'BARUERI', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '8400 Galão', 'L', 8400, 'SP', 'BARUERI', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '8400 Galão', 'L', 8400, 'SP', 'BARUERI', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - UBERABA MG - Volume 18120
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '18120 Galão', 'L', 18120, 'MG', 'UBERABA', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '18120 Galão', 'L', 18120, 'MG', 'UBERABA', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '18120 Galão', 'L', 18120, 'MG', 'UBERABA', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - IBIPORÃ PR - Volume 40800
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '40800 Galão', 'L', 40800, 'PR', 'IBIPORÃ', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '40800 Galão', 'L', 40800, 'PR', 'IBIPORÃ', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '40800 Galão', 'L', 40800, 'PR', 'IBIPORÃ', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - IBIPORÃ PR - Volume 20400
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20400 Galão', 'L', 20400, 'PR', 'IBIPORÃ', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20400 Galão', 'L', 20400, 'PR', 'IBIPORÃ', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20400 Galão', 'L', 20400, 'PR', 'IBIPORÃ', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - CUIABÁ MT - Volume 10000
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '10000 Galão', 'L', 10000, 'MT', 'CUIABÁ', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '10000 Galão', 'L', 10000, 'MT', 'CUIABÁ', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '10000 Galão', 'L', 10000, 'MT', 'CUIABÁ', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30'),

-- Inserir produtos SHIFT (FOMESAFEM) - IBIPORÃ PR - Volume 20401
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20401 Galão', 'L', 20401, 'PR', 'IBIPORÃ', 'Preço Unitário', 42.00, 42.00, 40.61, 5.52, 1.50, 2.32, 2.32, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20401 Galão', 'L', 20401, 'PR', 'IBIPORÃ', 'Preço Banda menor', 40.00, 40.00, 38.68, 5.52, 1.50, 2.21, 2.21, '2026-11-30'),
('SHIFT', '6818', 'Alta', 'FOMESAFEM', '3322', '20401 Galão', 'L', 20401, 'PR', 'IBIPORÃ', 'Preço Banda maior', 45.00, 45.00, 43.51, 5.52, 1.50, 2.48, 2.48, '2026-11-30');