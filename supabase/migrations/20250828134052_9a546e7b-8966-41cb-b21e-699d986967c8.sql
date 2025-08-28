-- Create inventory/stock table
CREATE TABLE inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_sku TEXT NOT NULL,
  product_name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  active_ingredient TEXT,
  mapa_number TEXT,
  packaging TEXT NOT NULL DEFAULT '4X5L',
  volume_available NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'L',
  state TEXT NOT NULL,
  city TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  price_tier TEXT NOT NULL CHECK (price_tier IN ('Preço Unitário', 'Preço Banda menor', 'Preço Banda maior')),
  base_price NUMERIC NOT NULL,
  client_price NUMERIC NOT NULL,
  commission_unit NUMERIC NOT NULL,
  net_commission NUMERIC NOT NULL,
  commission_percentage NUMERIC NOT NULL,
  rep_percentage NUMERIC NOT NULL,
  supplier_net NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better performance
CREATE INDEX idx_inventory_sku ON inventory(product_sku);
CREATE INDEX idx_inventory_location ON inventory(state, city);
CREATE INDEX idx_inventory_tier ON inventory(price_tier);

-- Enable RLS
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access for inventory" 
ON inventory 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage inventory" 
ON inventory 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_inventory_updated_at
BEFORE UPDATE ON inventory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create product documents table
CREATE TABLE product_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_sku TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('bula', 'fisqp', 'fds', 'ficha_emergencia', 'adapar')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for documents
CREATE INDEX idx_product_documents_sku ON product_documents(product_sku);

-- Enable RLS
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for documents
CREATE POLICY "Public read access for product documents" 
ON product_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage product documents" 
ON product_documents 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_product_documents_updated_at
BEFORE UPDATE ON product_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial inventory data from spreadsheet
INSERT INTO inventory (product_sku, product_name, manufacturer, active_ingredient, mapa_number, volume_available, state, city, expiry_date, price_tier, base_price, client_price, commission_unit, net_commission, commission_percentage, rep_percentage, supplier_net) VALUES
-- ENTOAR entries
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 7160, 'SP', 'BARUERI', '2025-11-30', 'Preço Unitário', 54, 54, 1.79, 1.62, 3.31, 1.00, 52.21),
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 7160, 'SP', 'BARUERI', '2025-11-30', 'Preço Banda menor', 53.83, 53.83, 1.78, 1.61, 3.31, 1.00, 52.05),
('6831', 'ENTOAR', 'Rainbow', 'TEBUTHIURON RAINBOW', '45619', 7160, 'SP', 'BARUERI', '2025-11-30', 'Preço Banda maior', 55, 55, 1.82, 1.65, 3.31, 1.00, 53.18),

-- MAXAPAC 250 EC entries
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 16495, 'SP', 'BARUERI', '2026-04-30', 'Preço Unitário', 88, 88, 2.91, 2.64, 3.31, 1.00, 85.09),
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 100, 'RS', 'PASSO FUNDO', '2026-04-30', 'Preço Unitário', 88, 88, 2.91, 2.64, 3.31, 1.00, 85.09),
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 16495, 'SP', 'BARUERI', '2026-04-30', 'Preço Banda menor', 86, 86, 2.85, 2.58, 3.31, 1.00, 83.15),
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 100, 'RS', 'PASSO FUNDO', '2026-04-30', 'Preço Banda menor', 86, 86, 2.85, 2.58, 3.31, 1.00, 83.15),
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 16495, 'SP', 'BARUERI', '2026-04-30', 'Preço Banda maior', 90, 90, 2.98, 2.70, 3.31, 1.00, 87.02),
('11501', 'MAXAPAC 250 EC', 'Alta', 'TRINEXAPAQUE-ETÍLICO', '30520', 100, 'RS', 'PASSO FUNDO', '2026-04-30', 'Preço Banda maior', 90, 90, 2.98, 2.70, 3.31, 1.00, 87.02),

-- SHIFT entries (major volumes)
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 40800, 'PR', 'IBIPORÃ', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 40800, 'RS', 'PASSO FUNDO', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 20400, 'SP', 'BARUERI', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 18120, 'MG', 'UBERABA', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 16201, 'PR', 'IBIPORÃ', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),
('6818', 'SHIFT', 'Alta', 'FOMESAFEM', '3322', 10000, 'MT', 'CUIABÁ', '2026-11-30', 'Preço Unitário', 42, 42, 1.39, 1.26, 3.31, 1.00, 40.61),

-- VENTURE MAX entries
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1640, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Unitário', 125, 125, 4.14, 3.74, 3.31, 1.00, 120.86),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1200, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Unitário', 125, 125, 4.14, 3.74, 3.31, 1.00, 120.86),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 800, 'MG', 'UBERABA', '2026-08-31', 'Preço Unitário', 125, 125, 4.14, 3.74, 3.31, 1.00, 120.86),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1640, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Banda menor', 120, 120, 3.97, 3.59, 3.31, 1.00, 116.03),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1200, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Banda menor', 120, 120, 3.97, 3.59, 3.31, 1.00, 116.03),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 800, 'MG', 'UBERABA', '2026-08-31', 'Preço Banda menor', 120, 120, 3.97, 3.59, 3.31, 1.00, 116.03),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1640, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Banda maior', 130, 130, 4.30, 3.89, 3.31, 1.00, 125.70),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 1200, 'PR', 'IBIPORÃ', '2026-08-31', 'Preço Banda maior', 130, 130, 4.30, 3.89, 3.31, 1.00, 125.70),
('10867', 'VENTURE MAX', 'Alta', 'HALOXIFOPE', '31222', 800, 'MG', 'UBERABA', '2026-08-31', 'Preço Banda maior', 130, 130, 4.30, 3.89, 3.31, 1.00, 125.70);

-- Insert product documents
INSERT INTO product_documents (product_sku, document_type, document_name, document_url) VALUES
-- SHIFT documents
('6818', 'bula', 'Bula SHIFT', 'https://altadefensivos.com.br/wp-content/uploads/2024/08/BUL_SHIFT_02-2025.pdf'),
('6818', 'fisqp', 'FISQP SHIFT', 'https://altadefensivos.com.br/wp-content/uploads/2024/08/FDS-NBR-14725-PT-SHIFT.pdf'),
('6818', 'ficha_emergencia', 'Ficha Emergência SHIFT', 'https://altadefensivos.com.br/wp-content/uploads/2024/08/FE-PT-SHIFT.pdf'),

-- VENTURE MAX documents
('10867', 'bula', 'Bula Venture Max', 'https://altadefensivos.com.br/wp-content/uploads/2024/08/Bula-Venture-Max.pdf'),
('10867', 'fisqp', 'FISQP Venture Max', 'https://altadefensivos.com.br/wp-content/uploads/2024/08/FISPQ-VentureMax.pdf'),

-- ENTOAR documents
('6831', 'bula', 'Bula Entoar', 'https://www.rainbowagro.com.br/wp-content/uploads/2024/07/Bula_Entoar_Rev20231110.pdf'),
('6831', 'fisqp', 'FISQP Entoar', 'https://www.rainbowagro.com.br/wp-content/uploads/2024/07/FISPQ_ENTOAR.pdf'),
('6831', 'fds', 'FDS Entoar', 'https://www.rainbowagro.com.br/wp-content/uploads/2024/07/ENTOAR-FDS-0025.pdf'),

-- MAXAPAC 250 EC documents
('11501', 'bula', 'Bula Maxapac 250 EC', 'https://altadefensivos.com.br/wp-content/uploads/2024/07/F481034375_-Maxapac-250-SC-Bula-2.pdf'),
('11501', 'adapar', 'ADAPAR Maxapac 250 EC', 'https://www.adapar.pr.gov.br/sites/adapar/arquivos_restritos/files/documento/2024-02/maxapac_250_ecciprian.pdf');