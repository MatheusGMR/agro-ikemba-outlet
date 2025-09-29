import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Revenda {
  id: string;
  user_id: string;
  razao_social: string;
  cnpj: string;
  endereco_completo: string;
  cidade: string;
  estado: string;
  cep: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipo_conta?: string;
  chave_pix?: string;
  regioes_atuacao: string[];
  tipos_produto_interesse: string[];
  volume_minimo_compra: number;
  telefone_comercial?: string;
  email_comercial?: string;
  website?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface RevendaProduto {
  id: string;
  revenda_id: string;
  produto_sku: string;
  produto_nome: string;
  fabricante: string;
  ingrediente_ativo?: string;
  categoria: string;
  volume_disponivel: number;
  unidade: string;
  preco_unitario: number;
  preco_minimo?: number;
  cidade_origem: string;
  estado_origem: string;
  prazo_entrega_dias: number;
  data_validade: string;
  condicoes_armazenamento?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface OfertaCompra {
  id: string;
  revenda_id: string;
  produto_sku: string;
  produto_nome: string;
  volume_desejado: number;
  preco_ofertado: number;
  cidade_entrega: string;
  estado_entrega: string;
  prazo_entrega_desejado: number;
  status: string;
  observacoes?: string;
  resposta_fornecedor?: string;
  validade_oferta: string;
  created_at: string;
  updated_at: string;
}

// Hook para buscar a revenda atual
export function useCurrentRevenda() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['current-revenda', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('revendas')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Revenda;
    },
    enabled: !!user?.id,
  });
}

// Hook para criar/atualizar revenda
export function useUpsertRevenda() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation({
    mutationFn: async (revendaData: Omit<Revenda, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('revendas')
        .upsert({
          ...revendaData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['current-revenda'] });
      toast.success('Dados da revenda atualizados com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar dados da revenda: ' + error.message);
    },
  });
}

// Hook para buscar produtos da revenda
export function useRevendaProdutos() {
  const { data: revenda } = useCurrentRevenda();
  
  return useQuery({
    queryKey: ['revenda-produtos', revenda?.id],
    queryFn: async () => {
      if (!revenda?.id) throw new Error('Revenda not found');
      
      const { data, error } = await supabase
        .from('revenda_produtos')
        .select('*')
        .eq('revenda_id', revenda.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RevendaProduto[];
    },
    enabled: !!revenda?.id,
  });
}

// Hook para criar produto da revenda
export function useCreateRevendaProduto() {
  const queryClient = useQueryClient();
  const { data: revenda } = useCurrentRevenda();
  
  return useMutation({
    mutationFn: async (produtoData: Omit<RevendaProduto, 'id' | 'revenda_id' | 'created_at' | 'updated_at'>) => {
      if (!revenda?.id) throw new Error('Revenda not found');
      
      const { data, error } = await supabase
        .from('revenda_produtos')
        .insert({
          ...produtoData,
          revenda_id: revenda.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['revenda-produtos'] });
      toast.success('Produto adicionado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao adicionar produto: ' + error.message);
    },
  });
}

// Hook para buscar ofertas de compra
export function useOfertasCompra() {
  const { data: revenda } = useCurrentRevenda();
  
  return useQuery({
    queryKey: ['ofertas-compra', revenda?.id],
    queryFn: async () => {
      if (!revenda?.id) throw new Error('Revenda not found');
      
      const { data, error } = await supabase
        .from('ofertas_compra')
        .select('*')
        .eq('revenda_id', revenda.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as OfertaCompra[];
    },
    enabled: !!revenda?.id,
  });
}

// Hook para criar oferta de compra
export function useCreateOfertaCompra() {
  const queryClient = useQueryClient();
  const { data: revenda } = useCurrentRevenda();
  
  return useMutation({
    mutationFn: async (ofertaData: Omit<OfertaCompra, 'id' | 'revenda_id' | 'created_at' | 'updated_at'>) => {
      if (!revenda?.id) throw new Error('Revenda not found');
      
      const { data, error } = await supabase
        .from('ofertas_compra')
        .insert({
          ...ofertaData,
          revenda_id: revenda.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ofertas-compra'] });
      toast.success('Oferta de compra enviada com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao enviar oferta: ' + error.message);
    },
  });
}

// Hook para estatísticas do dashboard
export function useRevendaDashboardStats() {
  const { data: revenda } = useCurrentRevenda();
  
  return useQuery({
    queryKey: ['revenda-dashboard-stats', revenda?.id],
    queryFn: async () => {
      if (!revenda?.id) throw new Error('Revenda not found');
      
      // Buscar produtos disponíveis
      const { data: produtos, error: produtosError } = await supabase
        .from('revenda_produtos')
        .select('*')
        .eq('revenda_id', revenda.id)
        .eq('status', 'disponivel');
      
      if (produtosError) throw produtosError;
      
      // Buscar ofertas
      const { data: ofertas, error: ofertasError } = await supabase
        .from('ofertas_compra')
        .select('*')
        .eq('revenda_id', revenda.id);
      
      if (ofertasError) throw ofertasError;
      
      // Calcular estatísticas
      const totalProdutos = produtos?.length || 0;
      const volumeTotal = produtos?.reduce((acc, p) => acc + Number(p.volume_disponivel), 0) || 0;
      const ofertasPendentes = ofertas?.filter(o => o.status === 'pendente').length || 0;
      const ofertasAprovadas = ofertas?.filter(o => o.status === 'aprovada').length || 0;
      
      return {
        totalProdutos,
        volumeTotal,
        ofertasPendentes,
        ofertasAprovadas,
        totalOfertas: ofertas?.length || 0,
      };
    },
    enabled: !!revenda?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}