import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, MapPin, Calendar, ChevronRight, Beaker } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { GroupedProduct } from '@/types/inventory';

interface GroupedProductCardProps {
  product: GroupedProduct;
  onViewDistribution: (product: GroupedProduct) => void;
  className?: string;
}

export function GroupedProductCard({ product, onViewDistribution, className }: GroupedProductCardProps) {
  const hasMultiplePriceTiers = product.all_items.length > 1;
  const commission = product.main_item.commission_unit;
  
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{product.active_ingredient || product.name}</CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Beaker className="h-4 w-4" />
          {product.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {product.manufacturer} • SKU: {product.sku}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informações principais */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {product.total_volume.toLocaleString()}L
              </div>
              <div className="text-xs text-muted-foreground">disponíveis</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <div className="text-sm font-medium">
                {product.locations_count} {product.locations_count === 1 ? 'local' : 'locais'}
              </div>
              <div className="text-xs text-muted-foreground">de estoque</div>
            </div>
          </div>
        </div>

        {/* Preço principal */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-primary">Preço Unitário</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(product.main_item.client_price)}
              </div>
              <div className="text-xs text-muted-foreground">por {product.main_item.unit}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Comissão</div>
              <div className="text-lg font-semibold text-green-600">
                {formatCurrency(commission)}
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores adicionais */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {hasMultiplePriceTiers && (
              <Badge variant="secondary" className="text-xs">
                Múltiplos preços
              </Badge>
            )}
            <Badge variant="outline" className="text-xs">
              {product.main_item.packaging}
            </Badge>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDistribution(product)}
            className="text-xs gap-1"
          >
            Ver distribuição
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>

        {/* Data de validade */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t">
          <Calendar className="h-3 w-3" />
          <span>Validade: {new Date(product.main_item.expiry_date).toLocaleDateString('pt-BR')}</span>
        </div>
      </CardContent>
    </Card>
  );
}