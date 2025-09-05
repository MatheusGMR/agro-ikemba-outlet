import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ProductImage {
  id: string;
  product_sku: string;
  image_url: string | null;
  image_type: string;
  alt_text?: string;
  created_at: string;
  updated_at: string;
}

// Cache for file existence checks to avoid repeated API calls
const fileExistsCache = new Map<string, boolean>();

// Function to check if file exists in storage with caching
async function checkFileExists(fileName: string): Promise<boolean> {
  // Return cached result if available
  if (fileExistsCache.has(fileName)) {
    return fileExistsCache.get(fileName)!;
  }
  
  try {
    const { data, error } = await supabase.storage
      .from('product-images')
      .list('', {
        search: fileName
      });
    
    const exists = !error && data && data.some(file => file.name === fileName);
    
    // Cache the result
    fileExistsCache.set(fileName, exists);
    
    return exists;
  } catch {
    // Cache negative result
    fileExistsCache.set(fileName, false);
    return false;
  }
}

// Function to get Supabase Storage public URL only if file exists
async function getSupabaseStorageUrlIfExists(fileName: string): Promise<string | null> {
  const exists = await checkFileExists(fileName);
  
  if (!exists) {
    return null;
  }
  
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
      
      // Convert storage filename to full URL if data exists and file exists in storage
      if (data) {
        const imageUrl = await getSupabaseStorageUrlIfExists(data.image_url);
        return {
          ...data,
          image_url: imageUrl
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
      
      // Convert storage filenames to full URLs only if files exist
      const processedData = await Promise.all(
        (data || []).map(async (image) => {
          const imageUrl = await getSupabaseStorageUrlIfExists(image.image_url);
          return {
            ...image,
            image_url: imageUrl
          };
        })
      );
      
      return processedData;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

export function getProductImageUrl(sku: string, images: ProductImage[]): string | null {
  const image = images.find(img => img.product_sku === sku && img.image_type === 'main');
  return image?.image_url || null;
}

// Function to diagnose missing images in storage
export function useMissingProductImages() {
  return useQuery({
    queryKey: ['product-images', 'missing-diagnosis'],
    queryFn: async () => {
      const { data: imageRecords, error } = await supabase
        .from('product_images')
        .select('product_sku, image_url, image_type');
      
      if (error) throw error;
      
      const missingImages: Array<{
        product_sku: string;
        image_url: string;
        image_type: string;
        exists: boolean;
      }> = [];
      
      for (const record of imageRecords || []) {
        const exists = await checkFileExists(record.image_url);
        missingImages.push({
          product_sku: record.product_sku,
          image_url: record.image_url,
          image_type: record.image_type,
          exists
        });
      }
      
      return {
        total: imageRecords?.length || 0,
        missing: missingImages.filter(img => !img.exists),
        existing: missingImages.filter(img => img.exists),
        missingFiles: missingImages.filter(img => !img.exists).map(img => img.image_url)
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: process.env.NODE_ENV === 'development' // Only run in development
  });
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
      
      // Convert storage filenames to full URLs only if files exist
      const processedData = await Promise.all(
        (data || []).map(async (image) => {
          const imageUrl = await getSupabaseStorageUrlIfExists(image.image_url);
          return {
            ...image,
            image_url: imageUrl
          };
        })
      );
      
      return processedData;
    },
    enabled: !!sku
  });
}