import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RepresentativeService } from '@/services/representativeService';
import { useAuth } from '@/hooks/useAuth';
import type { 
  Representative, 
  RepClient, 
  Opportunity, 
  OpportunityItem,
  RepActivity, 
  Commission,
  RepDashboardStats 
} from '@/types/representative';

// Representative hooks
export function useCurrentRepresentative() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['representative', 'current', user?.id ?? 'anon'],
    queryFn: () => RepresentativeService.getCurrentRepresentative(),
    enabled: !!user?.id, // Only enabled when user exists - prevents race conditions
    staleTime: 600000, // 10 minutes - longer cache for profile data
    gcTime: 1200000, // 20 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000)
  });
}

// Client hooks
export function useRepClients(representativeId: string) {
  return useQuery({
    queryKey: ['rep-clients', representativeId],
    queryFn: () => RepresentativeService.getClients(representativeId),
    enabled: !!representativeId
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RepresentativeService.createClient,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rep-clients', data.representative_id] });
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<RepClient> }) =>
      RepresentativeService.updateClient(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rep-clients', data.representative_id] });
    }
  });
}

export function useBulkCreateClients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ representativeId, clients }: { 
      representativeId: string; 
      clients: Array<Omit<RepClient, 'id' | 'created_at' | 'updated_at' | 'representative_id'> & { representative_id: string }>
    }) => {
      const results = await Promise.allSettled(
        clients.map(client => 
          RepresentativeService.createClient(client)
        )
      );
      return results;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['rep-clients', variables.representativeId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-stats', variables.representativeId] 
      });
    }
  });
}

// Opportunity hooks
export function useOpportunities(representativeId: string) {
  return useQuery({
    queryKey: ['opportunities', representativeId],
    queryFn: () => RepresentativeService.getOpportunities(representativeId),
    enabled: !!representativeId
  });
}

export function useCreateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RepresentativeService.createOpportunity,
    onSuccess: (data) => {
      // More specific invalidation to prevent duplicate cards
      queryClient.invalidateQueries({ 
        queryKey: ['opportunities', data.representative_id],
        exact: true
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard-stats', data.representative_id],
        exact: true 
      });
      // Refetch to ensure fresh data
      queryClient.refetchQueries({ 
        queryKey: ['opportunities', data.representative_id] 
      });
    }
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Opportunity> }) => 
      RepresentativeService.updateOpportunity(id, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunities', data.representative_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', data.representative_id] });
    }
  });
}

// Opportunity items hooks
export function useOpportunityItems(opportunityId: string) {
  return useQuery({
    queryKey: ['opportunity-items', opportunityId],
    queryFn: () => RepresentativeService.getOpportunityItems(opportunityId),
    enabled: !!opportunityId
  });
}

export function useAddOpportunityItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RepresentativeService.addOpportunityItem,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['opportunity-items', data.opportunity_id] });
    }
  });
}

// Activity hooks
export function useRepActivities(representativeId: string) {
  return useQuery({
    queryKey: ['rep-activities', representativeId],
    queryFn: () => RepresentativeService.getActivities(representativeId),
    enabled: !!representativeId
  });
}

export function useCreateActivity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: RepresentativeService.createActivity,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rep-activities', data.representative_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', data.representative_id] });
    }
  });
}

// Dashboard hooks with performance optimizations
export function useDashboardStats(representativeId: string) {
  return useQuery({
    queryKey: ['dashboard-stats', representativeId],
    queryFn: () => RepresentativeService.getDashboardStats(representativeId),
    enabled: !!representativeId,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: 'always',
    retry: (failureCount, error) => {
      // Don't retry if it's a network timeout
      if (error.message?.includes('Timeout')) return false;
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000)
  });
}

// Commission hooks
export function useCommissions(representativeId: string) {
  return useQuery({
    queryKey: ['commissions', representativeId],
    queryFn: () => RepresentativeService.getCommissions(representativeId),
    enabled: !!representativeId
  });
}