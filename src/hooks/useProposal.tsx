import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Proposal } from '@/types/representative';

interface ApprovalData {
  client_name: string;
  client_position: string;
  client_email?: string;
  client_phone?: string;
  comments?: string;
  signature?: string | null;
}

// Public access to proposals (no auth required)
export function useProposalPublic(publicLink: string) {
  return useQuery({
    queryKey: ['proposal', 'public', publicLink],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select(`
          *,
          opportunity:opportunities!inner(
            id,
            title,
            client:rep_clients!inner(
              id,
              company_name,
              cnpj_cpf,
              contact_name,
              email,
              phone,
              city,
              state
            ),
            items:opportunity_items(
              id,
              product_sku,
              product_name,
              quantity,
              unit_price,
              total_price
            )
          )
        `)
        .eq('public_link', publicLink)
        .single();

      if (error) throw error;
      return data as Proposal & {
        opportunity: {
          id: string;
          title: string;
          client: {
            id: string;
            company_name: string;
            cnpj_cpf?: string;
            contact_name?: string;
            email?: string;
            phone?: string;
            city?: string;
            state?: string;
          };
          items: Array<{
            id: string;
            product_sku: string;
            product_name: string;
            quantity: number;
            unit_price: number;
            total_price: number;
          }>;
        };
      };
    },
    enabled: !!publicLink,
    staleTime: 0, // Always fetch fresh data for public proposals
    refetchOnWindowFocus: false,
    retry: 1
  });
}

export function useApproveProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, approvalData }: { 
      proposalId: string; 
      approvalData: ApprovalData 
    }) => {
      const { data, error } = await supabase.functions.invoke('approve-proposal', {
        body: {
          proposal_id: proposalId,
          approval_data: {
            client_name: approvalData.client_name,
            client_position: approvalData.client_position,
            client_email: approvalData.client_email,
            client_phone: approvalData.client_phone,
            comments: approvalData.comments,
            signature: approvalData.signature
          }
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['proposal', 'public', variables.proposalId] 
      });
    }
  });
}

export function useRejectProposal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ proposalId, comments }: { 
      proposalId: string; 
      comments?: string 
    }) => {
      const { data, error } = await supabase.functions.invoke('reject-proposal', {
        body: {
          proposal_id: proposalId,
          comments
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['proposal', 'public', variables.proposalId] 
      });
    }
  });
}