import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package2 } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';

interface LocationStockProps {
  inventory: InventoryItem[];
}

export function LocationStock({ inventory }: LocationStockProps) {
  // Group inventory by location
  const locationGroups = inventory.reduce((acc, item) => {
    const key = `${item.city}/${item.state}`;
    if (!acc[key]) {
      acc[key] = {
        city: item.city,
        state: item.state,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {} as Record<string, { city: string; state: string; items: InventoryItem[] }>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Estoque por Localidade
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Object.values(locationGroups).map((location, index) => {
            const totalVolume = location.items.reduce((sum, item) => sum + item.volume_available, 0);
            const priceRange = {
              min: Math.min(...location.items.map(item => item.client_price)),
              max: Math.max(...location.items.map(item => item.client_price))
            };
            
            return (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {location.city}/{location.state}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package2 className="w-3 h-3" />
                      {totalVolume.toLocaleString()}L
                    </div>
                  </div>
                </div>
                
                <div className="text-sm">
                  <div className="font-medium">
                    R$ {priceRange.min.toFixed(2)} - R$ {priceRange.max.toFixed(2)}/L
                  </div>
                  <div className="text-muted-foreground">
                    {location.items.length} lote(s) disponível(is)
                  </div>
                </div>
                
                <div className="flex gap-1 flex-wrap">
                  {[...new Set(location.items.map(item => item.price_tier))].map((tier, tierIndex) => (
                    <Badge key={tierIndex} variant="secondary" className="text-xs">
                      {tier.replace('Preço ', '')}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        {Object.keys(locationGroups).length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Package2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum estoque encontrado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}