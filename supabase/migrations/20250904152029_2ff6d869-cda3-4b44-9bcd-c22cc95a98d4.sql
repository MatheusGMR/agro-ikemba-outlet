-- Limpar dados antigos do inventário
DELETE FROM inventory;

-- Inserir dados corretos conforme planilha fornecida

-- SKU 6831 - ENTOAR - 7160 Kg em Barueri-SP
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 45.00, 52.00, 7.00, 50120.00, 13.5, 1.0, 322400.00),
-- Preço Banda menor  
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 45.00, 48.00, 3.00, 21480.00, 6.3, 1.0, 322400.00),
-- Preço Banda maior
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 45.00, 46.00, 1.00, 7160.00, 2.2, 1.0, 322400.00);

-- SKU 11501 - MAXAPAC 250 EC - 15795 L em Barueri-SP
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 28.00, 32.00, 4.00, 63180.00, 12.5, 1.0, 442260.00),
-- Preço Banda menor
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 28.00, 30.00, 2.00, 31590.00, 6.7, 1.0, 442260.00),
-- Preço Banda maior
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 28.00, 29.00, 1.00, 15795.00, 3.4, 1.0, 442260.00);

-- SKU 10867 - VENTURE MAX - Múltiplas localizações
-- Ibiporã-PR: 1200L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 35.00, 42.00, 7.00, 8400.00, 16.7, 1.0, 42000.00),
-- Preço Banda menor
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 35.00, 39.00, 4.00, 4800.00, 10.3, 1.0, 42000.00),
-- Preço Banda maior
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 35.00, 37.00, 2.00, 2400.00, 5.4, 1.0, 42000.00);

-- Ibiporã-PR: 1640L (segundo lote)
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 35.00, 42.00, 7.00, 11480.00, 16.7, 1.0, 57400.00),
-- Preço Banda menor
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 35.00, 39.00, 4.00, 6560.00, 10.3, 1.0, 57400.00),
-- Preço Banda maior
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 35.00, 37.00, 2.00, 3280.00, 5.4, 1.0, 57400.00);

-- Uberaba-MG: 800L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Unitário', 35.00, 42.00, 7.00, 5600.00, 16.7, 1.0, 28000.00),
-- Preço Banda menor
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda menor', 35.00, 39.00, 4.00, 3200.00, 10.3, 1.0, 28000.00),
-- Preço Banda maior
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda maior', 35.00, 37.00, 2.00, 1600.00, 5.4, 1.0, 28000.00);

-- SKU 6818 - SHIFT - Múltiplas localizações
-- Ibiporã-PR: 620L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 3720.00, 21.4, 1.0, 13640.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 1860.00, 12.0, 1.0, 13640.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 1240.00, 8.3, 1.0, 13640.00);

-- Barueri-SP: 8400L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 50400.00, 21.4, 1.0, 184800.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 25200.00, 12.0, 1.0, 184800.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 16800.00, 8.3, 1.0, 184800.00);

-- Uberaba-MG: 18120L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 108720.00, 21.4, 1.0, 398640.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 54360.00, 12.0, 1.0, 398640.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 36240.00, 8.3, 1.0, 398640.00);

-- Ibiporã-PR: 40800L (segundo lote)
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 244800.00, 21.4, 1.0, 897600.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 122400.00, 12.0, 1.0, 897600.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 81600.00, 8.3, 1.0, 897600.00);

-- Ibiporã-PR: 20400L (terceiro lote)
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 122400.00, 21.4, 1.0, 448800.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 61200.00, 12.0, 1.0, 448800.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 40800.00, 8.3, 1.0, 448800.00);

-- Cuiabá-MT: 10000L
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 60000.00, 21.4, 1.0, 220000.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 30000.00, 12.0, 1.0, 220000.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 20000.00, 8.3, 1.0, 220000.00);

-- Ibiporã-PR: 20401L (quarto lote)
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- Preço Unitário  
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 22.00, 28.00, 6.00, 122406.00, 21.4, 1.0, 448822.00),
-- Preço Banda menor
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 22.00, 25.00, 3.00, 61203.00, 12.0, 1.0, 448822.00),
-- Preço Banda maior
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 22.00, 24.00, 2.00, 40802.00, 8.3, 1.0, 448822.00);