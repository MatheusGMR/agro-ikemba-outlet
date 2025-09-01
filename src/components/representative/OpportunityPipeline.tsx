import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useOpportunities, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { formatCurrency } from '@/lib/utils';
import { Opportunity } from '@/types/representative';
import { ChevronRight, Calendar, DollarSign } from 'lucide-react';

const STAGE_LABELS = {
  com_oportunidade: 'Com Oportunidade',
  proposta_apresentada: 'Proposta Apresentada', 
  em_negociacao: 'Em Negociação',
  em_aprovacao: 'Em Aprovação',
  em_entrega: 'Em Entrega'
};

const STAGE_COLORS = {
  com_oportunidade: 'bg-slate-100 text-slate-800',
  proposta_apresentada: 'bg-blue-100 text-blue-800',
  em_negociacao: 'bg-yellow-100 text-yellow-800',
  em_aprovacao: 'bg-orange-100 text-orange-800',
  em_entrega: 'bg-green-100 text-green-800'
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  onStageChange: (opportunityId: string, newStage: string) => void;
}

function OpportunityCard({ opportunity, onStageChange }: OpportunityCardProps) {
  const stageKeys = Object.keys(STAGE_LABELS) as Array<keyof typeof STAGE_LABELS>;
  const currentStageIndex = stageKeys.indexOf(opportunity.stage);
  const nextStage = currentStageIndex < stageKeys.length - 1 ? stageKeys[currentStageIndex + 1] : null;

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{opportunity.title}</h4>
            <p className="text-xs text-muted-foreground">
              {opportunity.client?.company_name}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs ${STAGE_COLORS[opportunity.stage]}`}
          >
            {opportunity.probability}%
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatCurrency(opportunity.estimated_value)}
          </div>
          {opportunity.expected_close_date && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(opportunity.expected_close_date).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>

        {opportunity.next_action && (
          <p className="text-xs text-muted-foreground mb-3">
            <strong>Próxima ação:</strong> {opportunity.next_action}
          </p>
        )}

        {nextStage && opportunity.stage !== 'em_entrega' && (
          <Button
            size="sm"
            variant="outline"
            className="w-full text-xs"
            onClick={() => onStageChange(opportunity.id, nextStage)}
          >
            Avançar para {STAGE_LABELS[nextStage]}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function OpportunityPipeline() {
  const { data: representative } = useCurrentRepresentative();
  const { data: opportunities = [], isLoading } = useOpportunities(representative?.id || '');

  const handleStageChange = (opportunityId: string, newStage: string) => {
    // TODO: Implementar mudança de estágio
    console.log('Changing stage:', opportunityId, newStage);
  };

  if (isLoading) {
    return <div>Carregando pipeline...</div>;
  }

  // Agrupar oportunidades por estágio
  const opportunitiesByStage = opportunities.reduce((acc, opp) => {
    if (!acc[opp.stage]) {
      acc[opp.stage] = [];
    }
    acc[opp.stage].push(opp);
    return acc;
  }, {} as Record<string, Opportunity[]>);

  const activeStages = Object.keys(STAGE_LABELS).filter(stage => 
    opportunitiesByStage[stage]?.length > 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
        <Button>Nova Oportunidade</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeStages.map(stage => (
          <div key={stage} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                {STAGE_LABELS[stage as keyof typeof STAGE_LABELS]}
              </h3>
              <Badge variant="outline" className="text-xs">
                {opportunitiesByStage[stage]?.length || 0}
              </Badge>
            </div>
            
            <div className="space-y-2">
              {opportunitiesByStage[stage]?.map(opportunity => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onStageChange={handleStageChange}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            Nenhuma oportunidade encontrada
          </p>
          <Button>Criar Primeira Oportunidade</Button>
        </div>
      )}
    </div>
  );
}