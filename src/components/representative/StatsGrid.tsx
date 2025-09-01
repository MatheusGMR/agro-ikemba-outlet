import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Target, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RepDashboardStats } from '@/types/representative';

interface StatsGridProps {
  stats: RepDashboardStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  const indicators = [
    {
      title: "Comissão Potencial",
      value: formatCurrency(stats.potential_commission),
      description: "Valor total baseado no estoque disponível",
      icon: <DollarSign className="h-6 w-6 text-primary" />,
      color: "border-green-200 bg-green-50/50"
    },
    {
      title: "Oportunidades Ativas",
      value: stats.active_opportunities.toString(),
      description: "Negociações em andamento",
      icon: <Target className="h-6 w-6 text-primary" />,
      color: "border-blue-200 bg-blue-50/50"
    },
    {
      title: "Propostas Pendentes",
      value: stats.pending_proposals.toString(),
      description: "Aguardando aprovação",
      icon: <FileText className="h-6 w-6 text-primary" />,
      color: "border-orange-200 bg-orange-50/50"
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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