import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOpportunities, useCurrentRepresentative, useUpdateOpportunity } from '@/hooks/useRepresentative';
import { formatCurrency } from '@/lib/utils';
import { Opportunity } from '@/types/representative';
import { 
  Building, 
  Phone, 
  FileText, 
  List,
  TrendingUp,
  ChevronRight,
  XCircle,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import LossReasonDialog from './LossReasonDialog';
import { ReservationExpiryAlert } from './ReservationExpiryAlert';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const STAGE_LABELS = {
  proposta_criada: 'Proposta Criada',
  proposta_enviada: 'Proposta Enviada',
  em_faturamento: 'Em Faturamento',
  em_pagamento: 'Em Pagamento',
  em_entrega: 'Em Entrega'
};

const STAGE_COLORS = {
  proposta_criada: 'bg-blue-100 text-blue-800 border-blue-200',
  proposta_enviada: 'bg-purple-100 text-purple-800 border-purple-200',
  em_faturamento: 'bg-orange-100 text-orange-800 border-orange-200',
  em_pagamento: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  em_entrega: 'bg-green-100 text-green-800 border-green-200'
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAdvanceStage: (opportunityId: string, newStage: string) => void;
  onCreateProposal: (opportunity: Opportunity) => void;
  onMarkAsLost: (opportunity: Opportunity) => void;
  onMarkAsWon: (opportunityId: string) => void;
  proposal?: {
    id: string;
    reservation_status?: string;
    reservation_expires_at?: string;
  };
}

function OpportunityCard({ opportunity, onAdvanceStage, onCreateProposal, onMarkAsLost, onMarkAsWon, proposal }: OpportunityCardProps) {
  const stageKeys = Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>;
  
  // Type guard: only handle new stages
  const isNewStage = (stage: string): stage is keyof typeof STAGE_LABELS => {
    return stage in STAGE_LABELS;
  };
  
  if (!isNewStage(opportunity.stage)) {
    return null; // Don't render opportunities with old stages
  }
  
  const currentStageIndex = stageKeys.indexOf(opportunity.stage);
  const nextStage = currentStageIndex < stageKeys.length - 1 ? stageKeys[currentStageIndex + 1] : null;

  // Calcular horas restantes para expiração
  const hoursLeft = proposal?.reservation_expires_at 
    ? (new Date(proposal.reservation_expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    : null;

  const isExpiringSoon = hoursLeft !== null && hoursLeft > 0 && hoursLeft <= 24;
  const isExpired = hoursLeft !== null && hoursLeft <= 0;

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Alerta de reserva */}
        {proposal?.reservation_expires_at && (
          <div className="mb-3">
            <ReservationExpiryAlert 
              expiresAt={proposal.reservation_expires_at}
              reservationStatus={proposal.reservation_status}
            />
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-1">{opportunity.client?.company_name}</h4>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-medium">
                {opportunity.title}
              </div>
              {opportunity.client?.cnpj_cpf && (
                <div className="text-xs text-muted-foreground">
                  CNPJ: {opportunity.client.cnpj_cpf}
                </div>
              )}
              {opportunity.client?.contact_name && (
                <div className="text-xs text-muted-foreground">
                  Contato: {opportunity.client.contact_name}
                </div>
              )}
              {opportunity.client?.phone && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{opportunity.client.phone}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end">
            <Badge 
              variant="outline" 
              className={`text-xs ${STAGE_COLORS[opportunity.stage]}`}
            >
              {opportunity.probability}%
            </Badge>
            {/* Badge de urgência para reservas expirando */}
            {isExpiringSoon && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                <Clock className="h-3 w-3 mr-1" />
                Expira em {Math.floor(hoursLeft!)}h
              </Badge>
            )}
            {isExpired && (
              <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Expirada
              </Badge>
            )}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-sm font-medium text-green-600">
            {formatCurrency(opportunity.estimated_value)}
          </div>
          <div className="text-xs text-muted-foreground">
            Comissão: {formatCurrency(opportunity.estimated_commission)}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-1">
            {nextStage && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => onAdvanceStage(opportunity.id, nextStage)}
              >
                Avançar
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
            
            {opportunity.stage === 'em_entrega' && (
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                onClick={() => onMarkAsWon(opportunity.id)}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Ganhou
              </Button>
            )}
            
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
              onClick={() => onMarkAsLost(opportunity)}
            >
              <XCircle className="h-3 w-3 mr-1" />
              Perdeu
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function OpportunityKanban() {
  const { data: representative } = useCurrentRepresentative();
  const { data: opportunities = [], isLoading, error } = useOpportunities(representative?.id || '');
  const updateOpportunity = useUpdateOpportunity();
  const isMobile = useIsMobile();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [lossDialogOpen, setLossDialogOpen] = useState(false);
  const [selectedOpportunityForLoss, setSelectedOpportunityForLoss] = useState<Opportunity | null>(null);

  // Buscar propostas com reservas para cada oportunidade
  const { data: proposalsWithReservations = [] } = useQuery({
    queryKey: ['proposals-with-reservations', representative?.id],
    queryFn: async () => {
      if (!representative?.id) return [];
      
      const { data, error } = await supabase
        .from('proposals')
        .select('id, opportunity_id, reservation_status, reservation_expires_at')
        .in('opportunity_id', opportunities.map(o => o.id))
        .eq('reservation_status', 'active');
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!representative?.id && opportunities.length > 0,
  });

  console.info('🎯 OpportunityKanban - representative:', representative?.id, 'opportunities:', opportunities.length, 'loading:', isLoading, 'error:', error);

  const handleAdvanceStage = async (opportunityId: string, newStage: string) => {
    try {
      await updateOpportunity.mutateAsync({
        id: opportunityId,
        updates: { stage: newStage as any }
      });
      
      toast({
        title: "Estágio atualizado",
        description: "Oportunidade avançou para o próximo estágio",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar estágio da oportunidade",
        variant: "destructive",
      });
    }
  };

  const handleCreateProposal = (opportunity: Opportunity) => {
    console.log('Creating proposal for:', opportunity.id);
    // TODO: Implementar criação de proposta
  };

  const handleMarkAsLost = (opportunity: Opportunity) => {
    setSelectedOpportunityForLoss(opportunity);
    setLossDialogOpen(true);
  };

  const handleConfirmLoss = async (reason: string, comments?: string) => {
    if (!selectedOpportunityForLoss) return;

    try {
      await updateOpportunity.mutateAsync({
        id: selectedOpportunityForLoss.id,
        updates: {
          status: 'closed',
          description: `${selectedOpportunityForLoss.description || ''}\n\nMotivo da perda: ${reason}${comments ? `\nComentários: ${comments}` : ''}`
        }
      });
      
      toast({
        title: "Oportunidade marcada como perdida",
        description: "A oportunidade foi atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar oportunidade como perdida",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsWon = async (opportunityId: string) => {
    try {
      await updateOpportunity.mutateAsync({
        id: opportunityId,
        updates: {
          status: 'closed'
        }
      });
      
      toast({
        title: "Oportunidade ganha! 🎉",
        description: "Parabéns! A oportunidade foi marcada como ganha",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar oportunidade como ganha",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-4"></div>
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="h-3 bg-muted rounded"></div>
                  <div className="h-24 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state with friendly message
  if (error && opportunities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pipeline de Oportunidades</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              ⚠️ Não foi possível carregar as oportunidades no momento.
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente.
            </p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Agrupar oportunidades por estágio (apenas oportunidades ativas)
  // Ordenar por prioridade: data de criação (mais antiga = maior prioridade)
  // Se datas forem próximas (< 24h), desempatar por valor (maior = maior prioridade)
  const activeOpportunities = opportunities
    .filter(opp => opp.status === 'active')
    .sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      const dateDiff = dateA - dateB;
      
      // Se a diferença for menor que 24h, ordenar por valor
      if (Math.abs(dateDiff) < 86400000) {
        return b.estimated_value - a.estimated_value;
      }
      return dateDiff;
    });
  
  const opportunitiesByStage = activeOpportunities.reduce((acc, opp) => {
    if (!acc[opp.stage]) {
      acc[opp.stage] = [];
    }
    acc[opp.stage].push(opp);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  const stageKeys = Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>;

  if (viewMode === 'list') {
    return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Oportunidades</h2>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('kanban')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Evolução
              </Button>
            )}
          </div>
        </div>
      </div>
      <div>
          <div className="space-y-4">
            {activeOpportunities.map(opportunity => (
              <Card key={opportunity.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{opportunity.client?.company_name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.title} • {formatCurrency(opportunity.estimated_value)}
                    </p>
                  </div>
                  <Badge className={STAGE_COLORS[opportunity.stage]}>
                    {STAGE_LABELS[opportunity.stage]}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Oportunidades</h2>
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                Lista
              </Button>
            )}
          </div>
        </div>
      </div>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stageKeys.map(stage => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm">
                  {STAGE_LABELS[stage]}
                </h3>
                <Badge variant="outline" className="text-xs">
                  {opportunitiesByStage[stage]?.length || 0}
                </Badge>
              </div>
              
              <div className="space-y-2 min-h-[200px]">
                {opportunitiesByStage[stage]?.map(opportunity => {
                  const proposal = proposalsWithReservations.find(p => p.opportunity_id === opportunity.id);
                  
                  return (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onAdvanceStage={handleAdvanceStage}
                      onCreateProposal={handleCreateProposal}
                      onMarkAsLost={handleMarkAsLost}
                      onMarkAsWon={handleMarkAsWon}
                      proposal={proposal}
                    />
                  );
                })}
                
                {(!opportunitiesByStage[stage] || opportunitiesByStage[stage].length === 0) && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <LossReasonDialog
        open={lossDialogOpen}
        onOpenChange={setLossDialogOpen}
        opportunityTitle={selectedOpportunityForLoss?.title || ''}
        onConfirm={handleConfirmLoss}
      />
    </div>
  );
}