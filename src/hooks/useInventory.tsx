import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventoryService';
import { offlineStorage } from '@/utils/offlineStorage';
import { useNetworkStatus } from './useNetworkStatus';
import type { GroupedProduct } from '@/types/inventory';

export function useInventoryBySku(sku: string) {
  return useQuery({
    queryKey: ['inventory', sku],
    queryFn: () => InventoryService.getInventoryBySku(sku),
    enabled: !!sku
  });
}

export function useAllInventory() {
  return useQuery({
    queryKey: ['inventory', 'all'],
    queryFn: () => InventoryService.getAllInventory()
  });
}

export function useProductsWithInventory() {
  return useQuery({
    queryKey: ['products', 'with-inventory'],
    queryFn: () => InventoryService.getProductsWithInventory(),
    staleTime: 10 * 60 * 1000, // 10 minutes - longer cache for better performance
    gcTime: 15 * 60 * 1000, // 15 minutes garbage collection
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
}

export function useProductDocuments(sku: string) {
  return useQuery({
    queryKey: ['product-documents', sku],
    queryFn: () => InventoryService.getProductDocuments(sku),
    enabled: !!sku
  });
}

export function useTotalVolumeAvailable() {
  return useQuery({
    queryKey: ['inventory', 'total-volume'],
    queryFn: () => InventoryService.getTotalVolumeAvailable(),
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
}

export function useGroupedProductsForSales() {
  const { isOnline } = useNetworkStatus();

  return useQuery<GroupedProduct[]>({
    queryKey: ['products', 'grouped-for-sales'],
    queryFn: async (): Promise<GroupedProduct[]> => {
      const CACHE_KEY = 'grouped-products-for-sales';
      
      try {
        const data = await InventoryService.getGroupedProductsForSales();
        // Save to offline cache
        await offlineStorage.set(CACHE_KEY, data, 5 * 60 * 1000);
        return data;
      } catch (error) {
        // If offline, try to get from cache
        if (!isOnline) {
          const cached = await offlineStorage.getStale<GroupedProduct[]>(CACHE_KEY);
          if (cached) {
            console.log('[useGroupedProductsForSales] Using offline cache');
            return cached;
          }
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: isOnline ? 3 : 0,
  });
}