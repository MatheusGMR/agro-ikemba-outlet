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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('representatives')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) throw error;
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
    const { data, error } = await supabase
      .from('opportunities')
      .select(`
        *,
        client:rep_clients(*)
      `)
      .eq('representative_id', representativeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Opportunity[];
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

  // Dashboard Stats
  static async getDashboardStats(representativeId: string): Promise<RepDashboardStats> {
    // Buscar oportunidades ativas
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select(`
        *,
        client:rep_clients(*)
      `)
      .eq('representative_id', representativeId)
      .eq('status', 'active');

    if (oppError) throw oppError;

    // Buscar atividades recentes
    const { data: activities, error: actError } = await supabase
      .from('rep_activities')
      .select(`
        *,
        client:rep_clients(*),
        opportunity:opportunities(*)
      `)
      .eq('representative_id', representativeId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (actError) throw actError;

    // Buscar notificações não lidas
    const { data: notifications, error: notError } = await supabase
      .from('rep_notifications')
      .select('*')
      .eq('representative_id', representativeId)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (notError) throw notError;

    // Buscar comissões do mês
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: commissions, error: commError } = await supabase
      .from('commissions')
      .select('*')
      .eq('representative_id', representativeId)
      .gte('created_at', startOfMonth.toISOString());

    if (commError) throw commError;

    // Calcular estatísticas
    const activeOpportunities = opportunities || [];
    const potentialCommission = activeOpportunities.reduce((sum, opp) => sum + (opp.estimated_commission || 0), 0);
    const pendingProposals = activeOpportunities.filter(opp => ['proposal_sent', 'client_approval'].includes(opp.stage)).length;
    const totalCommissionThisMonth = (commissions || []).reduce((sum, comm) => sum + comm.commission_amount, 0);

    // Agrupar por estágio
    const stageGroups = activeOpportunities.reduce((acc, opp) => {
      const stage = opp.stage;
      if (!acc[stage]) {
        acc[stage] = { count: 0, value: 0 };
      }
      acc[stage].count += 1;
      acc[stage].value += opp.estimated_value || 0;
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const pipelineStages = Object.entries(stageGroups).map(([stage, data]) => ({
      stage,
      count: data.count,
      value: data.value
    }));

    // Top 5 oportunidades por valor
    const topOpportunities = activeOpportunities
      .sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0))
      .slice(0, 5);

    return {
      potential_commission: potentialCommission,
      active_opportunities: activeOpportunities.length,
      pending_proposals: pendingProposals,
      total_commission_this_month: totalCommissionThisMonth,
      pipeline_stages: pipelineStages,
      top_opportunities: topOpportunities as Opportunity[],
      recent_activities: (activities || []) as RepActivity[],
      pending_notifications: (notifications || []) as RepNotification[]
    };
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