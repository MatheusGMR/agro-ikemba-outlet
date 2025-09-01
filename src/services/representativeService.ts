import { supabase } from '@/integrations/supabase/client';
import type { 
  Representative, 
  RepClient, 
  Opportunity, 
  OpportunityItem,
  Proposal, 
  SalesOrder, 
  Commission, 
  RepActivity, 
  RepNotification,
  RepDashboardStats 
} from '@/types/representative';

export class RepresentativeService {
  // Representatives
  static async getCurrentRepresentative(): Promise<Representative | null> {
    console.log('=== VERIFICANDO REPRESENTANTE ATUAL ===');
    
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Usuário autenticado:', user?.id, user?.email);
    
    if (!user) {
      console.log('Nenhum usuário autenticado encontrado');
      return null;
    }

    console.log('Consultando representante para user_id:', user.id);
    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Erro ao buscar representante:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        code: error.code,
        hint: error.hint
      });
      throw error;
    }

    console.log('Resultado da consulta:', data ? 'Representante encontrado' : 'Nenhum representante encontrado');
    console.log('Dados do representante:', data);

    return data as Representative;
  }

  static async createRepresentative(rep: Omit<Representative, 'id' | 'created_at' | 'updated_at'>): Promise<Representative> {
    const { data, error } = await supabase
      .from('representatives')
      .insert(rep)
      .select()
      .single();

    if (error) throw error;
    return data as Representative;
  }

  static async updateRepresentative(id: string, updates: Partial<Representative>): Promise<Representative> {
    const { data, error } = await supabase
      .from('representatives')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Representative;
  }

  // Clients
  static async getClients(representativeId: string): Promise<RepClient[]> {
    const { data, error } = await supabase
      .from('rep_clients')
      .select('*')
      .eq('representative_id', representativeId)
      .order('company_name');

    if (error) throw error;
    return data || [];
  }

  static async createClient(client: Omit<RepClient, 'id' | 'created_at' | 'updated_at'>): Promise<RepClient> {
    const { data, error } = await supabase
      .from('rep_clients')
      .insert(client)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateClient(id: string, updates: Partial<RepClient>): Promise<RepClient> {
    const { data, error } = await supabase
      .from('rep_clients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Opportunities
  static async getOpportunities(representativeId: string): Promise<Opportunity[]> {
    try {
      console.info('🔍 Fetching opportunities for representative:', representativeId);
      
      // First, get opportunities
      const { data: opportunities, error: oppError } = await supabase
        .from('opportunities')
        .select('*')
        .eq('representative_id', representativeId)
        .order('created_at', { ascending: false });

      if (oppError) {
        console.error('❌ Error fetching opportunities:', oppError);
        throw oppError;
      }

      if (!opportunities || opportunities.length === 0) {
        console.info('ℹ️ No opportunities found for representative');
        return [];
      }

      // Then get clients separately
      const clientIds = opportunities.map(opp => opp.client_id).filter(Boolean);
      let clients: any[] = [];
      
      if (clientIds.length > 0) {
        const { data: clientsData, error: clientError } = await supabase
          .from('rep_clients')
          .select('*')
          .in('id', clientIds);

        if (clientError) {
          console.warn('⚠️ Error fetching clients, continuing without client data:', clientError);
        } else {
          clients = clientsData || [];
        }
      }

      // Merge data in memory
      const opportunitiesWithClients = opportunities.map(opp => ({
        ...opp,
        client: clients.find(client => client.id === opp.client_id) || null
      }));

      console.info('✅ Successfully fetched opportunities:', opportunitiesWithClients.length);
      return opportunitiesWithClients as Opportunity[];
      
    } catch (error) {
      console.error('❌ Failed to fetch opportunities:', error);
      throw error;
    }
  }

  static async createOpportunity(opportunity: Omit<Opportunity, 'id' | 'created_at' | 'updated_at'>): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .insert(opportunity)
      .select(`
        *,
        client:rep_clients(*)
      `)
      .single();

    if (error) throw error;
    return data as Opportunity;
  }

  static async updateOpportunity(id: string, updates: Partial<Opportunity>): Promise<Opportunity> {
    const { data, error } = await supabase
      .from('opportunities')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        client:rep_clients(*)
      `)
      .single();

    if (error) throw error;
    return data as Opportunity;
  }

  // Opportunity Items
  static async getOpportunityItems(opportunityId: string): Promise<OpportunityItem[]> {
    const { data, error } = await supabase
      .from('opportunity_items')
      .select('*')
      .eq('opportunity_id', opportunityId)
      .order('created_at');

    if (error) throw error;
    return data || [];
  }

  static async addOpportunityItem(item: Omit<OpportunityItem, 'id' | 'created_at'>): Promise<OpportunityItem> {
    const { data, error } = await supabase
      .from('opportunity_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Proposals
  static async createProposal(proposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at' | 'proposal_number'>): Promise<Proposal> {
    // Gerar número da proposta
    const { data: proposalNumber, error: numberError } = await supabase.rpc('generate_proposal_number');
    if (numberError) throw numberError;

    const { data, error } = await supabase
      .from('proposals')
      .insert({ ...proposal, proposal_number: proposalNumber })
      .select(`
        *,
        opportunity:opportunities(
          *,
          client:rep_clients(*)
        )
      `)
      .single();

    if (error) throw error;
    return data as Proposal;
  }

  static async updateProposal(id: string, updates: Partial<Proposal>): Promise<Proposal> {
    const { data, error } = await supabase
      .from('proposals')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        opportunity:opportunities(
          *,
          client:rep_clients(*)
        )
      `)
      .single();

    if (error) throw error;
    return data as Proposal;
  }

  // Activities
  static async getActivities(representativeId: string, limit = 50): Promise<RepActivity[]> {
    const { data, error } = await supabase
      .from('rep_activities')
      .select(`
        *,
        client:rep_clients(*),
        opportunity:opportunities(*)
      `)
      .eq('representative_id', representativeId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as RepActivity[];
  }

  static async createActivity(activity: Omit<RepActivity, 'id' | 'created_at'>): Promise<RepActivity> {
    const { data, error } = await supabase
      .from('rep_activities')
      .insert(activity)
      .select(`
        *,
        client:rep_clients(*),
        opportunity:opportunities(*)
      `)
      .single();

    if (error) throw error;
    return data as RepActivity;
  }

  // Dashboard statistics
  static async getDashboardStats(representativeId: string): Promise<RepDashboardStats> {
    try {
      console.info('📊 Iniciando busca de estatísticas do dashboard para:', representativeId);

      // Buscar oportunidades ativas
      const opportunitiesPromise = supabase
        .from('opportunities')
        .select('*')
        .eq('representative_id', representativeId)
        .eq('status', 'active');

      // Buscar propostas pendentes
      const proposalsPromise = supabase
        .from('proposals')
        .select(`
          *,
          opportunity:opportunities!inner(representative_id)
        `)
        .eq('opportunity.representative_id', representativeId)
        .in('status', ['draft', 'sent', 'viewed']);

      // Buscar comissões do mês atual
      const currentMonth = new Date();
      const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      
      const commissionsPromise = supabase
        .from('commissions')
        .select('commission_amount')
        .eq('representative_id', representativeId)
        .gte('created_at', firstDayOfMonth.toISOString())
        .eq('status', 'paid');

      // Buscar atividades recentes
      const activitiesPromise = supabase
        .from('rep_activities')
        .select(`
          *,
          client:rep_clients(*),
          opportunity:opportunities(*)
        `)
        .eq('representative_id', representativeId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Buscar notificações pendentes
      const notificationsPromise = supabase
        .from('rep_notifications')
        .select('*')
        .eq('representative_id', representativeId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(10);

      // Executar todas as consultas
      const [
        opportunitiesResult,
        proposalsResult,
        commissionsResult,
        activitiesResult,
        notificationsResult
      ] = await Promise.allSettled([
        opportunitiesPromise,
        proposalsPromise,
        commissionsPromise,
        activitiesPromise,
        notificationsPromise
      ]);

      // Processar oportunidades
      let opportunities: any[] = [];
      if (opportunitiesResult.status === 'fulfilled' && !opportunitiesResult.value.error) {
        opportunities = opportunitiesResult.value.data || [];
      } else {
        console.warn('⚠️ Erro ao buscar oportunidades:', opportunitiesResult);
      }

      // Processar propostas
      let proposals: any[] = [];
      if (proposalsResult.status === 'fulfilled' && !proposalsResult.value.error) {
        proposals = proposalsResult.value.data || [];
      } else {
        console.warn('⚠️ Erro ao buscar propostas:', proposalsResult);
      }

      // Processar comissões
      let totalCommissionThisMonth = 0;
      if (commissionsResult.status === 'fulfilled' && !commissionsResult.value.error) {
        const commissions = commissionsResult.value.data || [];
        totalCommissionThisMonth = commissions.reduce((sum: number, comm: any) => sum + (comm.commission_amount || 0), 0);
      } else {
        console.warn('⚠️ Erro ao buscar comissões:', commissionsResult);
      }

      // Processar atividades
      let activities: any[] = [];
      if (activitiesResult.status === 'fulfilled' && !activitiesResult.value.error) {
        activities = activitiesResult.value.data || [];
      } else {
        console.warn('⚠️ Erro ao buscar atividades:', activitiesResult);
      }

      // Processar notificações
      let notifications: any[] = [];
      if (notificationsResult.status === 'fulfilled' && !notificationsResult.value.error) {
        notifications = notificationsResult.value.data || [];
      } else {
        console.warn('⚠️ Erro ao buscar notificações:', notificationsResult);
      }

      // Calcular estatísticas por estágio
      const pipelineStages = [
        'com_oportunidade',
        'proposta_apresentada', 
        'em_negociacao',
        'em_aprovacao',
        'em_entrega'
      ].map(stage => {
        const stageOpps = opportunities.filter((opp: any) => opp.stage === stage);
        return {
          stage,
          count: stageOpps.length,
          value: stageOpps.reduce((sum: number, opp: any) => sum + (opp.estimated_value || 0), 0)
        };
      });

      // Calcular comissão potencial
      let potentialCommission = 0;
      
      // Primeiro tentar via edge function
      try {
        console.info('🔄 Tentando calcular comissão via edge function...');
        const { data: commissionData, error: commissionError } = await supabase.functions.invoke(
          'calculate-potential-commission',
          { body: { representativeId } }
        );

        if (commissionError) {
          console.warn('⚠️ Erro na edge function:', commissionError);
          throw commissionError;
        }

        potentialCommission = commissionData?.potentialCommission || 0;
        console.info('✅ Comissão calculada via edge function:', potentialCommission);
      } catch (functionError) {
        console.error('❌ Erro ao calcular comissão potencial via function:', functionError);
        
        // Fallback: calcular localmente
        console.info('🔄 Calculando comissão localmente como fallback...');
        potentialCommission = opportunities.reduce((sum: number, opp: any) => {
          return sum + (opp.estimated_commission || 0);
        }, 0);
        console.info('✅ Comissão calculada localmente:', potentialCommission);
      }

      // Preparar dados finais
      const stats: RepDashboardStats = {
        potential_commission: potentialCommission,
        active_opportunities: opportunities.length,
        pending_proposals: proposals.length,
        total_commission_this_month: totalCommissionThisMonth,
        pipeline_stages: pipelineStages,
        top_opportunities: opportunities
          .sort((a: any, b: any) => (b.estimated_value || 0) - (a.estimated_value || 0))
          .slice(0, 5),
        recent_activities: activities,
        pending_notifications: notifications
      };

      console.info('✅ Estatísticas do dashboard calculadas com sucesso');
      return stats;

    } catch (error) {
      console.error('❌ Erro grave ao buscar estatísticas do dashboard:', error);
      
      // Retornar stats padrão em caso de erro crítico
      const defaultStats: RepDashboardStats = {
        potential_commission: 0,
        active_opportunities: 0,
        pending_proposals: 0,
        total_commission_this_month: 0,
        pipeline_stages: [
          { stage: 'com_oportunidade', count: 0, value: 0 },
          { stage: 'proposta_apresentada', count: 0, value: 0 },
          { stage: 'em_negociacao', count: 0, value: 0 },
          { stage: 'em_aprovacao', count: 0, value: 0 },
          { stage: 'em_entrega', count: 0, value: 0 }
        ],
        top_opportunities: [],
        recent_activities: [],
        pending_notifications: []
      };

      console.info('📊 Retornando estatísticas padrão devido ao erro');
      return defaultStats;
    }
  }

  // Commissions
  static async getCommissions(representativeId: string): Promise<Commission[]> {
    const { data, error } = await supabase
      .from('commissions')
      .select(`
        *,
        order:sales_orders(
          *,
          client:rep_clients(*),
          proposal:proposals(*)
        )
      `)
      .eq('representative_id', representativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Commission[];
  }
}