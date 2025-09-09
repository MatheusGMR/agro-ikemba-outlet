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
  Kanban,
  ChevronRight,
  XCircle,
  CheckCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';
import LossReasonDialog from './LossReasonDialog';

const STAGE_LABELS = {
  com_oportunidade: 'Com Oportunidade',
  proposta_apresentada: 'Proposta Apresentada', 
  em_negociacao: 'Em Negociação',
  em_aprovacao: 'Em Aprovação',
  em_entrega: 'Em Entrega'
};

const STAGE_COLORS = {
  com_oportunidade: 'bg-slate-100 text-slate-800 border-slate-200',
  proposta_apresentada: 'bg-blue-100 text-blue-800 border-blue-200',
  em_negociacao: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  em_aprovacao: 'bg-orange-100 text-orange-800 border-orange-200',
  em_entrega: 'bg-green-100 text-green-800 border-green-200'
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onAdvanceStage: (opportunityId: string, newStage: string) => void;
  onCreateProposal: (opportunity: Opportunity) => void;
  onMarkAsLost: (opportunity: Opportunity) => void;
  onMarkAsWon: (opportunityId: string) => void;
}

function OpportunityCard({ opportunity, onAdvanceStage, onCreateProposal, onMarkAsLost, onMarkAsWon }: OpportunityCardProps) {
  const stageKeys = Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>;
  const currentStageIndex = stageKeys.indexOf(opportunity.stage);
  const nextStage = currentStageIndex < stageKeys.length - 1 ? stageKeys[currentStageIndex + 1] : null;

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">{opportunity.title}</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Building className="h-3 w-3" />
                <span>{opportunity.client?.company_name}</span>
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
          <Badge 
            variant="outline" 
            className={`text-xs ${STAGE_COLORS[opportunity.stage]}`}
          >
            {opportunity.probability}%
          </Badge>
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
          {opportunity.stage === 'com_oportunidade' && (
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs"
              onClick={() => onCreateProposal(opportunity)}
            >
              <FileText className="h-3 w-3 mr-1" />
              Criar Proposta
            </Button>
          )}
          
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

  console.info('🎯 OpportunityKanban - representative:', representative?.id, 'opportunities:', opportunities.length, 'loading:', isLoading, 'error:', error);

  // Auto-switch to list view on mobile
  useEffect(() => {
    if (isMobile) {
      setViewMode('list');
    } else {
      setViewMode('kanban');
    }
  }, [isMobile]);

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
  const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
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
                <Kanban className="h-4 w-4 mr-2" />
                Kanban
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
                    <h4 className="font-medium">{opportunity.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {opportunity.client?.company_name} • {formatCurrency(opportunity.estimated_value)}
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
                {opportunitiesByStage[stage]?.map(opportunity => (
                  <OpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    onAdvanceStage={handleAdvanceStage}
                    onCreateProposal={handleCreateProposal}
                    onMarkAsLost={handleMarkAsLost}
                    onMarkAsWon={handleMarkAsWon}
                  />
                ))}
                
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