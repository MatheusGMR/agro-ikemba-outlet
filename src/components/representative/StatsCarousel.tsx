import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, DollarSign, Target, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RepDashboardStats } from '@/types/representative';
import { useState } from 'react';

interface StatsCarouselProps {
  stats: RepDashboardStats;
}

export default function StatsCarousel({ stats }: StatsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const indicators = [
    {
      title: "Comissão Potencial",
      value: formatCurrency(stats.potential_commission),
      description: "Valor total baseado no estoque disponível",
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      color: "bg-gradient-to-br from-green-500 to-green-600"
    },
    {
      title: "Oportunidades Ativas",
      value: stats.active_opportunities.toString(),
      description: "Negociações em andamento",
      icon: <Target className="h-8 w-8 text-primary" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Propostas Pendentes",
      value: stats.pending_proposals.toString(),
      description: "Aguardando aprovação",
      icon: <FileText className="h-8 w-8 text-primary" />,
      color: "bg-gradient-to-br from-orange-500 to-orange-600"
    },
    {
      title: "Comissão Este Mês",
      value: formatCurrency(stats.total_commission_this_month),
      description: "Valor já conquistado",
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % indicators.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + indicators.length) % indicators.length);
  };

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-lg">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {indicators.map((indicator, index) => (
            <Card key={index} className="min-w-full">
              <CardContent className={`p-6 text-white ${indicator.color}`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {indicator.icon}
                      <h3 className="text-sm font-medium opacity-90">{indicator.title}</h3>
                    </div>
                    <p className="text-3xl font-bold mb-1">{indicator.value}</p>
                    <p className="text-sm opacity-80">{indicator.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={prevSlide}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          {indicators.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={nextSlide}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}