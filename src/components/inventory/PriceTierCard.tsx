import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingDown, Volume2 } from 'lucide-react';
import type { PriceTierBenefit } from '@/types/inventory';
import { formatVolume } from '@/lib/utils';

interface PriceTierCardProps {
  benefit: PriceTierBenefit;
  isRecommended?: boolean;
}

export function PriceTierCard({ benefit, isRecommended }: PriceTierCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Preço Unitário':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Preço Banda menor':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preço Banda maior':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case 'Preço Unitário':
        return 'Melhor Preço';
      case 'Preço Banda menor':
        return 'Preço Intermediário';
      case 'Preço Banda maior':
        return 'Preço Inicial';
      default:
        return tier;
    }
  };

  return (
    <Card className={`relative ${isRecommended ? 'ring-2 ring-primary' : ''}`}>
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground">Recomendado</Badge>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>{getTierLabel(benefit.tier)}</span>
          <Badge className={getTierColor(benefit.tier)}>
            {benefit.tier}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold text-primary">
          R$ {benefit.price.toFixed(2)}
          <span className="text-sm font-normal text-muted-foreground ml-1">/L</span>
        </div>
        
        {benefit.savings > 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm">
              Economize R$ {benefit.savings.toFixed(2)} ({benefit.savings_percentage.toFixed(1)}%)
            </span>
          </div>
        )}
        
        {benefit.volume_required && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Volume2 className="w-4 h-4" />
            <span className="text-sm">
              Volume mínimo: {formatVolume(benefit.volume_required)}L
            </span>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          {benefit.tier === 'Preço Unitário' && 'Acesso ao melhor preço disponível'}
          {benefit.tier === 'Preço Banda menor' && 'Preço competitivo para volumes médios'}
          {benefit.tier === 'Preço Banda maior' && 'Preço de entrada, aumente o volume para economizar mais'}
        </div>
      </CardContent>
    </Card>
  );
}