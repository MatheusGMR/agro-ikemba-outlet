import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Package, TrendingDown, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { GroupedProduct } from '@/types/inventory';

interface ProductDistributionDialogProps {
  product: GroupedProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDistributionDialog({ product, open, onOpenChange }: ProductDistributionDialogProps) {
  if (!product) return null;

  // Agrupar por localização
  const locationGroups = product.all_items.reduce((acc, item) => {
    const key = `${item.city}, ${item.state}`;
    if (!acc[key]) {
      acc[key] = { items: [], totalVolume: 0 };
    }
    acc[key].items.push(item);
    acc[key].totalVolume += item.volume_available;
    return acc;
  }, {} as Record<string, { items: typeof product.all_items, totalVolume: number }>);

  // Agrupar por tier de preço
  const priceGroups = product.all_items.reduce((acc, item) => {
    if (!acc[item.price_tier]) {
      acc[item.price_tier] = [];
    }
    acc[item.price_tier].push(item);
    return acc;
  }, {} as Record<string, typeof product.all_items>);

  const unitaryPrice = product.main_item.client_price;
  const minorBandPrice = priceGroups['Preço Banda menor']?.[0]?.client_price;
  const majorBandPrice = priceGroups['Preço Banda maior']?.[0]?.client_price;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Distribuição do Estoque - {product.active_ingredient || product.name}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {product.manufacturer} • SKU: {product.sku}
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações gerais */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {product.total_volume.toLocaleString()}L
                </div>
                <div className="text-sm text-muted-foreground">Volume Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {product.locations_count}
                </div>
                <div className="text-sm text-muted-foreground">Localidades</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(unitaryPrice)}
                </div>
                <div className="text-sm text-muted-foreground">Preço Unitário</div>
              </div>
            </CardContent>
          </Card>

          {/* Estratégia de Preços */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Estratégia de Preços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Preço Unitário */}
                <div className="p-4 rounded-lg border bg-primary/5 border-primary/20">
                  <div className="text-sm font-medium text-primary mb-1">Preço Unitário</div>
                  <div className="text-2xl font-bold">{formatCurrency(unitaryPrice)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Preço padrão recomendado
                  </div>
                </div>

                {/* Preço Banda Menor */}
                {minorBandPrice && (
                  <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                    <div className="text-sm font-medium text-yellow-700 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Preço Mínimo
                    </div>
                    <div className="text-2xl font-bold text-yellow-700">{formatCurrency(minorBandPrice)}</div>
                    <div className="text-xs text-yellow-600 mt-1">
                      Limite mínimo para grandes volumes
                    </div>
                  </div>
                )}

                {/* Preço Banda Maior */}
                {majorBandPrice && (
                  <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                    <div className="text-sm font-medium text-green-700 mb-1">Preço Premium</div>
                    <div className="text-2xl font-bold text-green-700">{formatCurrency(majorBandPrice)}</div>
                    <div className="text-xs text-green-600 mt-1">
                      Para volumes menores ou urgentes
                    </div>
                  </div>
                )}
              </div>

              {minorBandPrice && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="text-sm text-amber-800 font-medium mb-1">
                    ⚠️ Atenção - Preços Sensíveis
                  </div>
                  <div className="text-xs text-amber-700">
                    Os preços de banda menor são para negociações especiais. 
                    Use o preço unitário como padrão nas propostas.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distribuição por Localização */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Distribuição por Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(locationGroups).map(([location, data]) => (
                  <Card key={location} className="border-muted">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{location}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Volume Total:</span>
                        <Badge variant="secondary">
                          {data.totalVolume.toLocaleString()}L
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        {data.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant={item.price_tier === 'Preço Unitário' ? 'default' : 'outline'} 
                                className="text-xs"
                              >
                                {item.price_tier.replace('Preço ', '')}
                              </Badge>
                              <span>{item.volume_available.toLocaleString()}L</span>
                            </div>
                            <span className="font-medium">
                              {formatCurrency(item.client_price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Informações Técnicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Técnicas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Nome Técnico:</span>
                <p className="text-muted-foreground">{product.name}</p>
              </div>
              <div>
                <span className="font-medium">Embalagem:</span>
                <p className="text-muted-foreground">{product.main_item.packaging}</p>
              </div>
              <div>
                <span className="font-medium">Número MAPA:</span>
                <p className="text-muted-foreground">{product.main_item.mapa_number || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Validade:</span>
                <p className="text-muted-foreground">
                  {new Date(product.main_item.expiry_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}