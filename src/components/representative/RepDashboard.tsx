import { Button } from '@/components/ui/button';
import { useDashboardStats, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { Users, Plus, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import StatsCarousel from './StatsCarousel';
import StatsGrid from './StatsGrid';
import OpportunityKanban from './OpportunityKanban';
import InventoryConsultation from './InventoryConsultation';


export default function RepDashboard() {
  const auth = useAuth();
  const { data: representative, isLoading: repLoading } = useCurrentRepresentative();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats(representative?.id || '');
  const isMobile = useIsMobile();

  const overallLoading = auth.isLoading || repLoading || (representative?.id ? statsLoading : false);
  console.info('🏠 RepDashboard', { userId: auth.user?.id ?? null, repId: representative?.id ?? null, overallLoading, statsLoading, repLoading, hasStats: !!stats, error });

  if (overallLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // Criar stats padrão se não houver dados
  const defaultStats = {
    active_opportunities: 0,
    pending_proposals: 0,
    total_commission_this_month: 0,
    pipeline_stages: [],
    top_opportunities: [],
    recent_activities: [],
    pending_notifications: []
  };

  const dashboardStats = stats || defaultStats;

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
          <InventoryConsultation>
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Consultar Estoque
            </Button>
          </InventoryConsultation>
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Cadastrar Cliente
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && !stats && (
        <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ Alguns dados podem não estar atualizados. Verifique sua conexão e tente novamente.
          </p>
        </div>
      )}

      {/* Stats Display */}
      {isMobile ? (
        <StatsCarousel stats={dashboardStats} />
      ) : (
        <StatsGrid stats={dashboardStats} />
      )}

      {/* Opportunity Kanban */}
      <OpportunityKanban />
    </div>
  );
}