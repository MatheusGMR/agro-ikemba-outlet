import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserOrder {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  payment_method: string;
  logistics_option: string;
  items: any;
  created_at: string;
  updated_at: string;
}

export function useUserOrders(limit?: number) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['user-orders', user?.id, limit],
    queryFn: async (): Promise<UserOrder[]> => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching user orders:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}