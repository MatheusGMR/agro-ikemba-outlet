import { Button } from '@/components/ui/button';
import { useDashboardStats, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { Users, Plus } from 'lucide-react';
import StatsCarousel from './StatsCarousel';
import OpportunityKanban from './OpportunityKanban';


export default function RepDashboard() {
  const { data: representative } = useCurrentRepresentative();
  const { data: stats, isLoading } = useDashboardStats(representative?.id || '');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted animate-pulse rounded-lg mb-6" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
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
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Cadastrar Cliente
          </Button>
        </div>
      </div>

      {/* Stats Carousel */}
      <StatsCarousel stats={stats} />

      {/* Opportunity Kanban */}
      <OpportunityKanban />
    </div>
  );
}