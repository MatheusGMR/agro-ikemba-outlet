-- Criar políticas RLS para o bucket product-images
CREATE POLICY "Public read access for product images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Admins can manage product images" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'product-images');

-- Limpar dados antigos da tabela product_images
DELETE FROM public.product_images;

-- Inserir novas imagens com URLs do Supabase Storage
INSERT INTO public.product_images (product_sku, image_url, alt_text, image_type) VALUES
-- Venture Max (SKU: 10867)
('10867', 'venture-max-main.png', 'Venture Max - Herbicida', 'main'),

-- Ciprian (SKU: 11501) 
('11501', 'ciprian-main.png', 'Ciprian - Trinexapaque', 'main'),
('11501', 'ciprian-promotional.png', 'Ciprian - Material Promocional', 'promotional'),

-- Shift (SKU: 6818)
('6818', 'shift-main.png', 'Shift - Fomesafem', 'main'), 
('6818', 'shift-promotional.png', 'Shift - Material Promocional', 'promotional'),

-- Entoar (SKU: 6831)
('6831', 'entoar-main.png', 'Entoar - Herbicida', 'main');