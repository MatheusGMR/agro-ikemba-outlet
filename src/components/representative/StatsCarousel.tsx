import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Target, TrendingUp, Wallet } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { RepDashboardStats } from '@/types/representative';
import { useState, useRef } from 'react';

interface StatsCarouselProps {
  stats: RepDashboardStats;
}

export default function StatsCarousel({ stats }: StatsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Calculate total value of active opportunities
  const activeOpportunitiesValue = stats.pipeline_stages.reduce(
    (total, stage) => total + (stage.value || 0), 0
  );

  const indicators = [
    {
      title: "Potencial de Ganho Total",
      value: formatCurrency(stats.potential_total_gain || 0),
      description: `Comissão: ${formatCurrency(stats.potential_commission || 0)} + Margem: ${formatCurrency(stats.potential_overprice || 0)}`,
      icon: <Wallet className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-emerald-600"
    },
    {
      title: "Oportunidades Ativas",
      value: formatCurrency(activeOpportunitiesValue),
      description: "Valor total das negociações em andamento",
      icon: <Target className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600"
    },
    {
      title: "Comissão Este Mês",
      value: formatCurrency(stats.total_commission_this_month),
      description: "Valor já conquistado",
      icon: <TrendingUp className="h-8 w-8 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600"
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % indicators.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + indicators.length) % indicators.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  return (
    <div className="relative">
      <div 
        className="overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {indicators.map((indicator, index) => (
            <div key={index} className={`min-w-full p-6 text-white ${indicator.color} rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300`}>
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
            </div>
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