import { useQuery } from '@tanstack/react-query';
import { InventoryService } from '@/services/inventoryService';

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
    staleTime: 5 * 60 * 1000 // 5 minutes
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
  return useQuery({
    queryKey: ['products', 'grouped-for-sales'],
    queryFn: () => InventoryService.getGroupedProductsForSales(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}