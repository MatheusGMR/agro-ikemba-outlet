-- Restructure inventory table to consolidate price tiers
-- First, backup current data and create new structure

-- Add new price columns
ALTER TABLE public.inventory 
ADD COLUMN preco_unitario NUMERIC,
ADD COLUMN preco_banda_menor NUMERIC,
ADD COLUMN preco_banda_maior NUMERIC;

-- Remove old price tier system
ALTER TABLE public.inventory 
DROP COLUMN price_tier,
DROP COLUMN client_price;

-- Clear existing data to insert consolidated records
DELETE FROM public.inventory;

-- Insert consolidated inventory data
INSERT INTO public.inventory (
    product_sku, product_name, manufacturer, active_ingredient, mapa_number,
    packaging, volume_available, unit, state, city, expiry_date,
    base_price, preco_unitario, preco_banda_menor, preco_banda_maior,
    commission_unit, net_commission, commission_percentage, rep_percentage, supplier_net
) VALUES
-- SKU 11501 - CIPRIAN - BARUERI/SP
('11501', 'CIPRIAN', 'Manufacturer', 'Active Ingredient', '30520', 'Galão', 15795, 'L', 'SP', 'BARUERI', '2025-12-31', 88.00, 88.00, 86.00, 90.00, 5.00, 5.00, 5.68, 1.0, 83.00),

-- SKU 10867 - VENTURE MAX - 3 locations
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 2840, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 125.00, 125.00, 120.00, 130.00, 7.00, 7.00, 5.60, 1.0, 118.00),
('10867', 'VENTURE MAX', 'Manufacturer', 'Active Ingredient', '31222', 'Galão', 800, 'L', 'MG', 'UBERABA', '2025-12-31', 125.00, 125.00, 120.00, 130.00, 7.00, 7.00, 5.60, 1.0, 118.00),

-- SKU 6831 - ENTOAR - BARUERI/SP  
('6831', 'ENTOAR', 'Manufacturer', 'Active Ingredient', '45619', 'Kg', 7160, 'Kg', 'SP', 'BARUERI', '2025-12-31', 54.00, 54.00, 53.83, 55.00, 3.00, 3.00, 5.56, 1.0, 51.00),

-- SKU 6818 - SHIFT - 4 locations
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 82221, 'L', 'PR', 'IBIPORÃ', '2025-12-31', 42.00, 42.00, 40.00, 45.00, 2.50, 2.50, 5.95, 1.0, 39.50),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 8400, 'L', 'SP', 'BARUERI', '2025-12-31', 42.00, 42.00, 40.00, 45.00, 2.50, 2.50, 5.95, 1.0, 39.50),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 18120, 'L', 'MG', 'UBERABA', '2025-12-31', 42.00, 42.00, 40.00, 45.00, 2.50, 2.50, 5.95, 1.0, 39.50),
('6818', 'SHIFT', 'Manufacturer', 'Active Ingredient', '03322', 'Galão', 10000, 'L', 'MT', 'CUIABÁ', '2025-12-31', 42.00, 42.00, 40.00, 45.00, 2.50, 2.50, 5.95, 1.0, 39.50);