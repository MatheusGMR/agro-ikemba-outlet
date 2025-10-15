import { Badge } from '@/components/ui/badge';
import { Package, Lock } from 'lucide-react';

interface StockAvailabilityBadgeProps {
  totalVolume: number;
  availableVolume?: number;
  reservedVolume?: number;
  unit: string;
}

export function StockAvailabilityBadge({
  totalVolume,
  availableVolume,
  reservedVolume,
  unit
}: StockAvailabilityBadgeProps) {
  // Se não temos dados de available_volume, usar totalVolume
  const displayAvailable = availableVolume !== undefined ? availableVolume : totalVolume;
  const displayReserved = reservedVolume || 0;

  return (
    <div className="flex gap-2 items-center flex-wrap">
      <Badge variant="outline" className="bg-green-50 border-green-300">
        <Package className="h-3 w-3 mr-1 text-green-600" />
        <span className="text-green-900">
          {displayAvailable.toLocaleString('pt-BR')} {unit} disponível
        </span>
      </Badge>
      
      {displayReserved > 0 && (
        <Badge variant="outline" className="bg-orange-50 border-orange-300">
          <Lock className="h-3 w-3 mr-1 text-orange-600" />
          <span className="text-orange-900">
            {displayReserved.toLocaleString('pt-BR')} {unit} reservado
          </span>
        </Badge>
      )}
      
      <span className="text-xs text-muted-foreground">
        Total: {totalVolume.toLocaleString('pt-BR')} {unit}
      </span>
    </div>
  );
}
