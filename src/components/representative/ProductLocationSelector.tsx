import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Package, AlertTriangle } from 'lucide-react';
import { GroupedProduct, InventoryItem } from '@/types/inventory';
import { RepClient } from '@/types/representative';

interface LocationSelection {
  city: string;
  state: string;
  quantity: number;
  available_volume: number;
  inventory_item: InventoryItem;
}

interface ProductLocationSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: GroupedProduct;
  client?: RepClient | null;
  onConfirm: (selections: LocationSelection[]) => void;
}

export default function ProductLocationSelector({
  open,
  onOpenChange,
  product,
  client,
  onConfirm
}: ProductLocationSelectorProps) {
  const [selections, setSelections] = useState<LocationSelection[]>([]);

  // Group inventory items by location
  const locationGroups = useMemo(() => {
    const groups: Record<string, InventoryItem[]> = {};
    
    product.all_items.forEach(item => {
      const key = `${item.city}, ${item.state}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return Object.entries(groups).map(([location, items]) => {
      const [city, state] = location.split(', ');
      const totalVolume = items.reduce((sum, item) => sum + item.volume_available, 0);
      
      // Calculate proximity to client
      let proximity = 'distant';
      if (client?.city && client?.state) {
        if (city === client.city && state === client.state) {
          proximity = 'same_city';
        } else if (state === client.state) {
          proximity = 'same_state';
        }
      }

      return {
        city,
        state,
        location,
        items,
        totalVolume,
        proximity,
        mainItem: items[0] // Since all items now have the same prices, just use the first one
      };
    }).sort((a, b) => {
      // Sort by proximity first, then by volume
      const proximityOrder = { same_city: 0, same_state: 1, distant: 2 };
      const aProximity = proximityOrder[a.proximity as keyof typeof proximityOrder];
      const bProximity = proximityOrder[b.proximity as keyof typeof proximityOrder];
      
      if (aProximity !== bProximity) {
        return aProximity - bProximity;
      }
      
      return b.totalVolume - a.totalVolume;
    });
  }, [product.all_items, client]);

  const handleQuantityChange = (location: string, quantity: number) => {
    const locationGroup = locationGroups.find(g => g.location === location);
    if (!locationGroup) return;

    setSelections(prev => {
      const existing = prev.find(s => `${s.city}, ${s.state}` === location);
      
      if (quantity <= 0) {
        return prev.filter(s => `${s.city}, ${s.state}` !== location);
      }

      const newSelection: LocationSelection = {
        city: locationGroup.city,
        state: locationGroup.state,
        quantity,
        available_volume: locationGroup.totalVolume,
        inventory_item: locationGroup.mainItem
      };

      if (existing) {
        return prev.map(s => 
          `${s.city}, ${s.state}` === location ? newSelection : s
        );
      } else {
        return [...prev, newSelection];
      }
    });
  };

  const totalSelected = selections.reduce((sum, s) => sum + s.quantity, 0);
  const hasMinimumVolume = selections.every(s => s.quantity >= 10000);
  const allWithinAvailable = selections.every(s => s.quantity <= s.available_volume);

  const handleConfirm = () => {
    if (selections.length > 0 && hasMinimumVolume && allWithinAvailable) {
      onConfirm(selections);
      onOpenChange(false);
      setSelections([]);
    }
  };

  const getProximityLabel = (proximity: string) => {
    switch (proximity) {
      case 'same_city': return 'Mesma cidade';
      case 'same_state': return 'Mesmo estado';
      default: return 'Distante';
    }
  };

  const getProximityColor = (proximity: string) => {
    switch (proximity) {
      case 'same_city': return 'bg-green-100 text-green-800';
      case 'same_state': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecionar Localidades - {product.active_ingredient || product.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {client && (
            <Alert>
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Cliente: {client.company_name} • Localização: {client.city}, {client.state}
              </AlertDescription>
            </Alert>
          )}

          {!hasMinimumVolume && selections.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Volume mínimo por localidade: 10.000 {product.all_items[0]?.unit || 'L'}
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            {locationGroups.map((locationGroup) => {
              const currentSelection = selections.find(
                s => `${s.city}, ${s.state}` === locationGroup.location
              );
              const selectedQuantity = currentSelection?.quantity || 0;

              return (
                <Card key={locationGroup.location}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{locationGroup.location}</span>
                          <Badge className={getProximityColor(locationGroup.proximity)}>
                            {getProximityLabel(locationGroup.proximity)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div>Volume disponível: {locationGroup.totalVolume.toLocaleString()} {locationGroup.mainItem.unit}</div>
                          <div>Preço unitário: R$ {locationGroup.mainItem.preco_unitario.toFixed(2)}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Quantidade ({locationGroup.mainItem.unit}):</Label>
                          <Input
                            type="number"
                            min="0"
                            max={locationGroup.totalVolume}
                            step="1000"
                            value={selectedQuantity}
                            onChange={(e) => handleQuantityChange(locationGroup.location, parseInt(e.target.value) || 0)}
                            className="w-32"
                            placeholder="0"
                          />
                        </div>

                        {selectedQuantity > 0 && selectedQuantity < 10000 && (
                          <div className="text-sm text-red-600 mt-1">
                            Mínimo: 10.000 {locationGroup.mainItem.unit}
                          </div>
                        )}

                        {selectedQuantity > locationGroup.totalVolume && (
                          <div className="text-sm text-red-600 mt-1">
                            Quantidade excede estoque disponível
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {selections.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Resumo da Seleção</h4>
                <div className="space-y-2 text-sm">
                  {selections.map((selection, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{selection.city}, {selection.state}</span>
                      <span>{selection.quantity.toLocaleString()} {selection.inventory_item.unit}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 font-medium flex justify-between">
                    <span>Total:</span>
                    <span>{totalSelected.toLocaleString()} {product.all_items[0]?.unit || 'L'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selections.length === 0 || !hasMinimumVolume || !allWithinAvailable}
            >
              Confirmar Seleção ({selections.length} local{selections.length !== 1 ? 'ais' : ''})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}