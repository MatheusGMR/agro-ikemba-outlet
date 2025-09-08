import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface OrderDetails {
  id: string;
  order_number: string;
  items: any;
  total_amount: number;
  payment_method: string;
  logistics_option: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_name: string;
  user_phone: string;
  user_email: string;
  user_company?: string;
  user_type: string;
  products_summary: string;
}

export function useOrderDetails(orderId: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['order-details', orderId, user?.id],
    queryFn: async (): Promise<OrderDetails | null> => {
      if (!user?.id || !orderId) {
        return null;
      }

      const { data, error } = await supabase.rpc('get_order_details', {
        order_id: orderId
      });

      if (error) {
        console.error('Error fetching order details:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!user?.id && !!orderId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}