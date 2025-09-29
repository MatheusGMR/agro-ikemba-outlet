-- Inserir imagem do produto Ameris
INSERT INTO public.product_images (product_sku, image_url, image_type, alt_text)
VALUES ('6813', '/lovable-uploads/ameris-tebutirom.png', 'main', 'Ameris Tebutirom - Embalagem 20L')
ON CONFLICT DO NOTHING;