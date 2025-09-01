import { Card, CardContent } from '@/components/ui/card';
import { Target, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
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
      icon: <Target className="h-6 w-6 text-primary" />,
      color: "border-blue-200 bg-blue-50/50"
    },
    {
      title: "Comissão Este Mês",
      value: formatCurrency(stats.total_commission_this_month),
      description: "Valor já conquistado",
      icon: <TrendingUp className="h-6 w-6 text-primary" />,
      color: "border-purple-200 bg-purple-50/50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {indicators.map((indicator, index) => (
        <Card key={index} className={`${indicator.color} border`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              {indicator.icon}
              <h3 className="text-sm font-medium text-muted-foreground">{indicator.title}</h3>
            </div>
            <p className="text-2xl font-bold mb-1">{indicator.value}</p>
            <p className="text-sm text-muted-foreground">{indicator.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}