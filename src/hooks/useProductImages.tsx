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

// Function to get Supabase Storage public URL
function getSupabaseStorageUrl(fileName: string): string {
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
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
      
      // Convert storage filename to full URL if data exists
      if (data) {
        return {
          ...data,
          image_url: getSupabaseStorageUrl(data.image_url)
        };
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
      
      // Convert all storage filenames to full URLs
      const processedData = (data || []).map(image => ({
        ...image,
        image_url: getSupabaseStorageUrl(image.image_url)
      }));
      
      return processedData;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function getProductImageUrl(sku: string, images: ProductImage[]): string | null {
  const image = images.find(img => img.product_sku === sku && img.image_type === 'main');
  return image?.image_url || null;
}

// Function to get all images for a specific product (main + promotional)
export function useProductImages(sku: string) {
  return useQuery({
    queryKey: ['product-images', sku],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_images')
        .select('*')
        .eq('product_sku', sku)
        .order('image_type', { ascending: true }); // main first, then promotional
      
      if (error) throw error;
      
      // Convert all storage filenames to full URLs
      const processedData = (data || []).map(image => ({
        ...image,
        image_url: getSupabaseStorageUrl(image.image_url)
      }));
      
      return processedData;
    },
    enabled: !!sku
  });
}