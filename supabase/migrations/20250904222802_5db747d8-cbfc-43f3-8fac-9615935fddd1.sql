-- Criar bucket para imagens de produtos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Criar tabela para imagens de produtos
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_sku TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type TEXT DEFAULT 'main',
  alt_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS na tabela
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tabela
CREATE POLICY "Public read access for product images" 
ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Admins can manage product images" 
ON public.product_images FOR ALL USING (true);

-- Políticas para storage bucket
CREATE POLICY "Public read access for product images bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'product-images');

-- Trigger para updated_at
CREATE TRIGGER update_product_images_updated_at
BEFORE UPDATE ON public.product_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();