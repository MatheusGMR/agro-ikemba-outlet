import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDashboardStats, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { Users, Plus, Package } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import StatsCarousel from './StatsCarousel';
import StatsGrid from './StatsGrid';
import OpportunityKanban from './OpportunityKanban';
import InventoryConsultation from './InventoryConsultation';
import CreateOpportunityDialog from './CreateOpportunityDialog';
import { ClientRegistrationDialog } from './ClientRegistrationDialog';


export default function RepDashboard() {
  const auth = useAuth();
  const { data: representative, isLoading: repLoading } = useCurrentRepresentative();
  const { data: stats, isLoading: statsLoading, error } = useDashboardStats(representative?.id || '');
  const isMobile = useIsMobile();
  const [showCreateOpportunity, setShowCreateOpportunity] = useState(false);
  const [showClientRegistration, setShowClientRegistration] = useState(false);

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
    <div className="space-y-6 pb-20 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Olá, {representative?.name || 'Representante'}</h1>
          <p className="text-muted-foreground">
            Aqui está seu resumo de vendas.
          </p>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden sm:flex gap-2">
          <Button variant="outline" onClick={() => setShowCreateOpportunity(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Oportunidade
          </Button>
          <InventoryConsultation>
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Consultar Estoque
            </Button>
          </InventoryConsultation>
          <Button variant="outline" onClick={() => setShowClientRegistration(true)}>
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

      {/* Mobile Floating Action Buttons */}
      <div className="sm:hidden fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center justify-center gap-6 bg-background/95 backdrop-blur-sm rounded-full px-8 py-4 shadow-lg border">
          <Button
            size="sm"
            variant="ghost"
            className="h-12 w-12 rounded-full p-0 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-md"
            onClick={() => setShowCreateOpportunity(true)}
          >
            <Plus className="h-5 w-5" />
          </Button>
          
          <InventoryConsultation>
            <Button
              size="sm"
              variant="ghost"
              className="h-12 w-12 rounded-full p-0 bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md"
            >
              <Package className="h-5 w-5" />
            </Button>
          </InventoryConsultation>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-12 w-12 rounded-full p-0 bg-green-500 text-white hover:bg-green-600 transition-colors shadow-md"
            onClick={() => setShowClientRegistration(true)}
          >
            <Users className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Create Opportunity Dialog */}
      <Dialog open={showCreateOpportunity} onOpenChange={setShowCreateOpportunity}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nova Oportunidade</DialogTitle>
          </DialogHeader>
          <CreateOpportunityDialog onClose={() => setShowCreateOpportunity(false)} />
        </DialogContent>
      </Dialog>

      {/* Client Registration Dialog */}
      <ClientRegistrationDialog 
        open={showClientRegistration}
        onOpenChange={setShowClientRegistration}
        representativeId={representative?.id || ''}
      />
    </div>
  );
}