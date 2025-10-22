import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp, DollarSign } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { RepDashboardStats } from '@/types/representative';

interface StatsGridProps {
  stats: RepDashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  // Calculate total value of active opportunities
  const activeOpportunitiesValue = stats.pipeline_stages.reduce(
    (total, stage) => total + (stage.value || 0), 0
  );

  const indicators = [
    {
      title: "Oportunidades Ativas",
      value: formatCurrency(activeOpportunitiesValue),
      description: "Valor total das negociações em andamento",
      icon: <Target className="h-6 w-6 text-blue-600" />,
      color: "border-blue-200 bg-blue-50/50"
    },
    {
      title: "Ganho Previsto",
      value: formatCurrency(stats.potential_total_gain || 0),
      description: "Comissão (1,5%) + Margem das oportunidades ativas",
      breakdown: {
        commission: stats.potential_commission || 0,
        overprice: stats.potential_overprice || 0
      },
      icon: <TrendingUp className="h-6 w-6 text-green-600" />,
      color: "border-green-200 bg-green-50/50"
    },
    {
      title: "Ganho Realizado",
      value: formatCurrency(stats.total_commission_this_month),
      description: "Valores já conquistados este mês",
      icon: <DollarSign className="h-6 w-6 text-purple-600" />,
      color: "border-purple-200 bg-purple-50/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {indicators.map((indicator, index) => (
        <div 
          key={index} 
          className={cn(
            "space-y-3 p-6 bg-background rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-border/40",
            indicator.color
          )}
        >
          <div className="flex items-center gap-3">
            {indicator.icon}
            <h3 className="text-sm font-medium text-muted-foreground">{indicator.title}</h3>
          </div>
          <p className="text-2xl font-bold">{indicator.value}</p>
          <p className="text-sm text-muted-foreground">{indicator.description}</p>
          
          {/* Breakdown para Ganho Previsto */}
          {indicator.breakdown && (
            <div className="pt-2 mt-2 border-t border-border/30 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Comissão fixa (1,5%)</span>
                <span className="font-medium">{formatCurrency(indicator.breakdown.commission)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Ganho margem</span>
                <span className="font-medium">{formatCurrency(indicator.breakdown.overprice)}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}