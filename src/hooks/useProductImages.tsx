import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_sku: string;
  image_url: string;
  image_type: string;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

export function useProductImage(sku: string) {
  return useQuery({
    queryKey: ['product-image', sku],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_sku', sku)
        .eq('image_type', 'main')
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!sku
  });
}

export function useAllProductImages() {
  return useQuery({
    queryKey: ['product-images', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function getProductImageUrl(sku: string, images: ProductImage[]): string | null {
  const image = images.find(img => img.product_sku === sku && img.image_type === 'main');
  return image?.image_url || null;
}