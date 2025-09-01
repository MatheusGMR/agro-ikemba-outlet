import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/ui/custom/StatCard';
import { useDashboardStats, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { formatCurrency } from '@/lib/utils';
import { 
  DollarSign, 
  TrendingUp, 
  FileText, 
  Users, 
  Plus,
  Calendar,
  Bell,
  Target
} from 'lucide-react';

const STAGE_LABELS = {
  prospection: 'Prospecção',
  qualification: 'Qualificação',
  needs_analysis: 'Análise de Necessidades',
  viability: 'Viabilidade',
  proposal_sent: 'Proposta Enviada',
  client_approval: 'Aprovação Cliente',
  negotiation: 'Negociação',
  closed_won: 'Fechado Ganho',
  closed_lost: 'Fechado Perdido'
};

export default function RepDashboard() {
  const { data: representative } = useCurrentRepresentative();
  const { data: stats, isLoading } = useDashboardStats(representative?.id || '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Olá, {representative?.name}! Aqui está seu resumo de vendas.
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Oportunidade
          </Button>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Cadastrar Cliente
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Comissão Potencial"
          value={formatCurrency(stats.potential_commission)}
          description="Valor total baseado no estoque disponível"
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        
        <StatCard
          title="Oportunidades Ativas"
          value={stats.active_opportunities}
          description="Negociações em andamento"
          icon={<Target className="h-5 w-5 text-primary" />}
        />
        
        <StatCard
          title="Propostas Pendentes"
          value={stats.pending_proposals}
          description="Aguardando aprovação"
          icon={<FileText className="h-5 w-5 text-primary" />}
        />
        
        <StatCard
          title="Comissão Este Mês"
          value={formatCurrency(stats.total_commission_this_month)}
          description="Valor já conquistado"
          icon={<TrendingUp className="h-5 w-5 text-primary" />}
          trend={{ value: 8.2, isPositive: true }}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Pipeline Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.pipeline_stages.map((stage) => (
                <div key={stage.stage} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{STAGE_LABELS[stage.stage as keyof typeof STAGE_LABELS] || stage.stage}</p>
                    <p className="text-sm text-muted-foreground">
                      {stage.count} oportunidade{stage.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(stage.value)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Opportunities */}
        <Card>
          <CardHeader>
            <CardTitle>Principais Oportunidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.top_opportunities.slice(0, 5).map((opportunity) => (
                <div key={opportunity.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium truncate">{opportunity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.client?.company_name}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="font-semibold">{formatCurrency(opportunity.estimated_value)}</p>
                    <Badge variant="outline" className="text-xs">
                      {opportunity.probability}% prob.
                    </Badge>
                  </div>
                </div>
              ))}
              
              {stats.top_opportunities.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma oportunidade ativa no momento
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recent_activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {activity.activity_type === 'call' && <Calendar className="h-4 w-4 text-blue-500" />}
                    {activity.activity_type === 'email' && <FileText className="h-4 w-4 text-green-500" />}
                    {activity.activity_type === 'whatsapp' && <Users className="h-4 w-4 text-green-600" />}
                    {activity.activity_type === 'visit' && <Target className="h-4 w-4 text-purple-500" />}
                    {activity.activity_type === 'note' && <FileText className="h-4 w-4 text-gray-500" />}
                    {activity.activity_type === 'task' && <Calendar className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.client?.company_name && `${activity.client.company_name} • `}
                      {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {stats.recent_activities.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma atividade recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.pending_notifications.slice(0, 5).map((notification) => (
                <div key={notification.id} className="flex items-start gap-3">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    notification.type === 'error' ? 'bg-red-500' :
                    notification.type === 'warning' ? 'bg-yellow-500' :
                    notification.type === 'success' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
              
              {stats.pending_notifications.length === 0 && (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma notificação pendente
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}