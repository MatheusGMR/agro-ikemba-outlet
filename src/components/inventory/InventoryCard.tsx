import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Package, Calendar } from 'lucide-react';
import type { ProductWithInventory } from '@/types/inventory';

interface InventoryCardProps {
  product: ProductWithInventory;
  className?: string;
}

export function InventoryCard({ product, className }: InventoryCardProps) {
  const bestPrice = Math.min(...product.price_tiers.map(tier => tier.price));
  const worstPrice = Math.max(...product.price_tiers.map(tier => tier.price));
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{product.active_ingredient || product.name}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {product.manufacturer} • SKU: {product.sku}
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {product.total_volume.toLocaleString()}L disponíveis
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            {product.locations.length} localidades
          </Badge>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Faixa de preços:</span>
            <div className="text-right">
              <div className="text-lg font-bold text-primary">
                R$ {bestPrice.toFixed(2)} - R$ {worstPrice.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">por litro</div>
            </div>
          </div>
          
          <div className="flex gap-1 flex-wrap">
            {product.price_tiers.map((tier, index) => (
              <Badge 
                key={index}
                variant={tier.tier === 'Preço Unitário' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {tier.tier.replace('Preço ', '')}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Localidades:</span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {product.locations.slice(0, 3).map((location, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {location.city}/{location.state}
              </Badge>
            ))}
            {product.locations.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{product.locations.length - 3} mais
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-3 h-3" />
          <span>Validade: {new Date(product.expiry_date).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {product.documents.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {product.documents.length} documento(s) técnico(s)
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}