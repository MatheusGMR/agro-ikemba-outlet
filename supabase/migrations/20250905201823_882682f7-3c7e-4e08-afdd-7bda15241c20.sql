-- Clear existing inventory records for the 4 SKUs
DELETE FROM inventory WHERE product_sku IN ('6831', '11501', '10867', '6818');

-- Insert SKU 6831 (ENTOAR) - 1 record
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
('6831', 'ENTOAR', 'Manufacturer', 'Active Ingredient', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 54.00, 54.00, 5.40, 5.40, 10.0, 1.0, 48.60),
('6831', 'ENTOAR', 'Manufacturer', 'Active Ingredient', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 53.83, 53.83, 5.38, 5.38, 10.0, 1.0, 48.45),
('6831', 'ENTOAR', 'Manufacturer', 'Active Ingredient', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 55.00, 55.00, 5.50, 5.50, 10.0, 1.0, 49.50);

-- Insert SKU 11501 (CIPRIAN) - 1 record with 3 price tiers
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
('11501', 'CIPRIAN', 'Manufacturer', 'Active Ingredient', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 88.00, 88.00, 8.80, 8.80, 10.0, 1.0, 79.20),
('11501', 'CIPRIAN', 'Manufacturer', 'Active Ingredient', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 86.00, 86.00, 8.60, 8.60, 10.0, 1.0, 77.40),
('11501', 'CIPRIAN', 'Manufacturer', 'Active Ingredient', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 90.00, 90.00, 9.00, 9.00, 10.0, 1.0, 81.00);

-- Insert SKU 10867 (VENTURE MAX) - 3 locations with correct pricing
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- IBIPORÃ/PR - 1200L
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 125.00, 125.00, 12.50, 12.50, 10.0, 1.0, 112.50),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 120.00, 120.00, 12.00, 12.00, 10.0, 1.0, 108.00),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1200, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 130.00, 130.00, 13.00, 13.00, 10.0, 1.0, 117.00),
-- IBIPORÃ/PR - 1640L  
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 125.00, 125.00, 12.50, 12.50, 10.0, 1.0, 112.50),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 120.00, 120.00, 12.00, 12.00, 10.0, 1.0, 108.00),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 1640, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 130.00, 130.00, 13.00, 13.00, 10.0, 1.0, 117.00),
-- UBERABA/MG - 800L
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Unitário', 125.00, 125.00, 12.50, 12.50, 10.0, 1.0, 112.50),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda menor', 120.00, 120.00, 12.00, 12.00, 10.0, 1.0, 108.00),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda maior', 130.00, 130.00, 13.00, 13.00, 10.0, 1.0, 117.00);

-- Insert SKU 6818 (SHIFT) - 9 locations with correct pricing
INSERT INTO inventory (
  product_sku, product_name, manufacturer, active_ingredient, mapa_number,
  packaging, volume_available, unit, state, city, expiry_date,
  price_tier, base_price, client_price, commission_unit, net_commission,
  commission_percentage, rep_percentage, supplier_net
) VALUES
-- IBIPORÃ/PR - 620L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 620, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- BARUERI/SP - 8400L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- UBERABA/MG - 18120L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- IBIPORÃ/PR - 40800L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 40800, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- IBIPORÃ/PR - 20400L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20400, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- CUIABÁ/MT - 10000L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50),
-- IBIPORÃ/PR - 20401L
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Unitário', 42.00, 42.00, 4.20, 4.20, 10.0, 1.0, 37.80),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda menor', 40.00, 40.00, 4.00, 4.00, 10.0, 1.0, 36.00),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 20401, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 'Preço Banda maior', 45.00, 45.00, 4.50, 4.50, 10.0, 1.0, 40.50);