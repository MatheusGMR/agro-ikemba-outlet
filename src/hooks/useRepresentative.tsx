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
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    retry: 2
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
      queryClient.invalidateQueries({ queryKey: ['opportunities', data.representative_id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats', data.representative_id] });
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

// Dashboard hooks
export function useDashboardStats(representativeId: string) {
  return useQuery({
    queryKey: ['dashboard-stats', representativeId],
    queryFn: () => RepresentativeService.getDashboardStats(representativeId),
    enabled: !!representativeId,
    refetchInterval: 30000 // Refresh every 30 seconds
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