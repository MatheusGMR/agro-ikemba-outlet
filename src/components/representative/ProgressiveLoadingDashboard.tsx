import { useState, useEffect } from 'react';
import { useDashboardStats, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import StatsCarousel from './StatsCarousel';
import StatsGrid from './StatsGrid';
import OpportunityKanban from './OpportunityKanban';
import { toast } from 'sonner';

export default function ProgressiveLoadingDashboard() {
  const auth = useAuth();
  const { data: representative, isLoading: repLoading } = useCurrentRepresentative();
  const { data: stats, isLoading: statsLoading, error, refetch } = useDashboardStats(representative?.id || '');
  const isMobile = useIsMobile();
  const [hasShownStats, setHasShownStats] = useState(false);

  // Progressive loading stages
  const [loadingStage, setLoadingStage] = useState<'representative' | 'stats' | 'complete'>('representative');

  useEffect(() => {
    if (auth.isLoading) {
      setLoadingStage('representative');
    } else if (representative && statsLoading) {
      setLoadingStage('stats');
    } else if (representative && (stats || error)) {
      setLoadingStage('complete');
      if (stats && !hasShownStats) {
        setHasShownStats(true);
        // Show success only on first load
        toast.success('Dashboard carregado com sucesso!');
      }
    }
  }, [auth.isLoading, representative, statsLoading, stats, error, hasShownStats]);

  // Handle retry
  const handleRetry = () => {
    if (representative?.id) {
      refetch();
      toast.info('Recarregando dados...');
    }
  };

  // Loading States
  if (loadingStage === 'representative' || repLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-6 bg-muted/50 rounded-lg">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Carregando perfil do representante...</h2>
            <p className="text-sm text-muted-foreground">Verificando suas credenciais</p>
          </div>
        </div>
        <div className="h-64 bg-muted/30 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (loadingStage === 'stats') {
    return (
      <div className="space-y-6">
        {/* Header already loaded */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Olá, {representative?.name}! Carregando seus dados...
            </p>
          </div>
          
        </div>

        {/* Progressive loading indicators */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Carregando estatísticas...</p>
              <p className="text-sm text-blue-700">Buscando oportunidades, propostas e comissões</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-muted/50 animate-pulse rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <div className="h-4 w-20 bg-muted animate-pulse rounded mx-auto" />
                  <div className="h-8 w-16 bg-muted animate-pulse rounded mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State with Retry
  if (error && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Olá, {representative?.name}!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertCircle className="h-8 w-8 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">Erro ao carregar dados</h3>
            <p className="text-sm text-yellow-800 mt-1">
              Não foi possível carregar seus dados. Verifique sua conexão e tente novamente.
            </p>
          </div>
          <Button variant="outline" onClick={handleRetry} size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Success State - Full Dashboard
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
        
      </div>

      {/* Warning if using cached/fallback data */}
      {error && stats && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-800">
            ℹ️ Exibindo dados em cache. Alguns dados podem não estar atualizados.
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