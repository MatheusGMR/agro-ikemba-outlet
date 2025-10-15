import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface InventoryReservation {
  id: string;
  inventory_item_id: string;
  opportunity_id: string;
  proposal_id: string;
  product_sku: string;
  reserved_volume: number;
  city: string;
  state: string;
  status: 'active' | 'expired' | 'consumed' | 'cancelled';
  expires_at: string;
  consumed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  opportunity?: {
    id: string;
    title: string;
    representative_id: string;
    client?: {
      company_name: string;
    };
  };
  proposal?: {
    proposal_number: string;
    status: string;
  };
}

// Buscar todas as reservas (admin)
export function useAllReservations() {
  return useQuery({
    queryKey: ['reservations', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .select(`
          *,
          opportunity:opportunities(
            id,
            title,
            representative_id,
            client:rep_clients(company_name)
          ),
          proposal:proposals(proposal_number, status)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as InventoryReservation[];
    }
  });
}

// Buscar reservas por representante
export function useRepresentativeReservations(representativeId: string) {
  return useQuery({
    queryKey: ['reservations', 'representative', representativeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .select(`
          *,
          opportunity:opportunities!inner(
            id,
            title,
            representative_id,
            client:rep_clients(company_name)
          ),
          proposal:proposals(proposal_number, status)
        `)
        .eq('opportunity.representative_id', representativeId)
        .eq('status', 'active')
        .order('expires_at', { ascending: true });

      if (error) throw error;
      return data as InventoryReservation[];
    },
    enabled: !!representativeId
  });
}

// Buscar reservas por proposta
export function useProposalReservations(proposalId: string) {
  return useQuery({
    queryKey: ['reservations', 'proposal', proposalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_reservations')
        .select('*')
        .eq('proposal_id', proposalId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as InventoryReservation[];
    },
    enabled: !!proposalId
  });
}

// Cancelar reserva manualmente (admin)
export function useCancelReservation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (proposalId: string) => {
      const { error } = await supabase.rpc('cancel_inventory_reservation', {
        p_proposal_id: proposalId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    }
  });
}

// Estatísticas de reservas para dashboard
export function useReservationStats(representativeId?: string) {
  return useQuery({
    queryKey: ['reservation-stats', representativeId],
    queryFn: async () => {
      let query = supabase
        .from('inventory_reservations')
        .select(`
          *,
          opportunity:opportunities!inner(representative_id)
        `);
      
      if (representativeId) {
        query = query.eq('opportunity.representative_id', representativeId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const reservations = data as InventoryReservation[];
      
      // Calcular estatísticas
      const activeReservations = reservations.filter(r => r.status === 'active');
      const expiringIn24h = activeReservations.filter(r => {
        const hoursLeft = (new Date(r.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);
        return hoursLeft <= 24 && hoursLeft > 0;
      });
      
      const totalReservedVolume = activeReservations.reduce((sum, r) => sum + r.reserved_volume, 0);
      
      const confirmedCount = reservations.filter(r => r.status === 'consumed').length;
      const expiredCount = reservations.filter(r => r.status === 'expired').length;
      const conversionRate = reservations.length > 0 
        ? (confirmedCount / (confirmedCount + expiredCount)) * 100 
        : 0;

      return {
        activeCount: activeReservations.length,
        expiringIn24hCount: expiringIn24h.length,
        totalReservedVolume,
        conversionRate: Math.round(conversionRate),
        confirmedCount,
        expiredCount
      };
    },
    enabled: true
  });
}
