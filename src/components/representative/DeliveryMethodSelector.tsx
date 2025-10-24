import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Truck, Package, Globe, AlertCircle, Loader2 } from 'lucide-react';
import { useFreightCalculation } from '@/hooks/useFreightCalculation';
import { formatCurrency } from '@/lib/utils';
import { FreightCalculation } from '@/utils/freightCalculator';
import { formatDistance } from '@/utils/distanceCalculator';

interface LocationSelection {
  city: string;
  state: string;
  volume: number;
}

interface DeliveryMethodSelectorProps {
  selectedLocations: LocationSelection[];
  clientCity: string;
  clientState: string;
  totalCargoValue: number;
  totalVolume: number;
  currentDeliveryType: 'retirada' | 'entrega_nacional' | 'entrega_internacional';
  onDeliveryTypeChange: (type: 'retirada' | 'entrega_nacional' | 'entrega_internacional', freightData: FreightCalculation | null) => void;
}

export default function DeliveryMethodSelector({
  selectedLocations,
  clientCity,
  clientState,
  totalCargoValue,
  totalVolume,
  currentDeliveryType,
  onDeliveryTypeChange
}: DeliveryMethodSelectorProps) {
  
  // Para simplificar, usamos a primeira localização como origem
  // Em um cenário mais complexo, você poderia calcular a melhor rota
  const primaryOrigin = selectedLocations[0];
  
  const freight = useFreightCalculation(
    primaryOrigin?.city,
    primaryOrigin?.state,
    clientCity,
    clientState,
    totalCargoValue,
    totalVolume
  );

  const handleDeliveryChange = (value: string) => {
    const deliveryType = value as 'retirada' | 'entrega_nacional' | 'entrega_internacional';
    
    if (deliveryType === 'retirada') {
      onDeliveryTypeChange(deliveryType, null);
    } else if (deliveryType === 'entrega_nacional' && freight.nacional) {
      onDeliveryTypeChange(deliveryType, freight.nacional);
    } else if (deliveryType === 'entrega_internacional' && freight.internacional) {
      onDeliveryTypeChange(deliveryType, freight.internacional);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Método de Entrega</CardTitle>
          <CardDescription>
            Selecione como o produto será entregue ao cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={currentDeliveryType} onValueChange={handleDeliveryChange}>
            {/* Opção 1: Retirada */}
            <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="retirada" id="retirada" />
              <div className="flex-1">
                <Label htmlFor="retirada" className="cursor-pointer flex items-center gap-2 font-medium">
                  <Package className="h-4 w-4" />
                  Retirada no Local
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Cliente retira o produto no estoque. Sem custo adicional de frete.
                </p>
                <div className="mt-2 text-lg font-semibold text-green-600">
                  R$ 0,00
                </div>
              </div>
            </div>

            {/* Opção 2: Entrega Nacional */}
            <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="entrega_nacional" id="entrega_nacional" />
              <div className="flex-1">
                <Label htmlFor="entrega_nacional" className="cursor-pointer flex items-center gap-2 font-medium">
                  <Truck className="h-4 w-4" />
                  Entrega Nacional
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Frete nacional: R$ 13,00/km + seguro 0,35%
                </p>
                
                {freight.isLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculando frete...
                  </div>
                )}
                
                {!freight.isLoading && freight.nacional && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distância (ida + volta):</span>
                      <span className="font-medium">{formatDistance(freight.distance_km!)} × 2 = {freight.nacional.round_trip_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete básico:</span>
                      <span>{formatCurrency(freight.nacional.freight_subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seguro (0,35%):</span>
                      <span>{formatCurrency(freight.nacional.insurance_amount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-1 mt-1">
                      <span>Total Frete:</span>
                      <span className="text-blue-600">{formatCurrency(freight.nacional.total_freight_cost)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Frete por litro:</span>
                      <span>{formatCurrency(freight.nacional.freight_per_liter)}/L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Opção 3: Entrega Internacional */}
            <div className="flex items-start space-x-3 space-y-0 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
              <RadioGroupItem value="entrega_internacional" id="entrega_internacional" />
              <div className="flex-1">
                <Label htmlFor="entrega_internacional" className="cursor-pointer flex items-center gap-2 font-medium">
                  <Globe className="h-4 w-4" />
                  Entrega Internacional
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Frete internacional: R$ 15,00/km + seguro 0,45%
                </p>
                
                {freight.isLoading && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calculando frete...
                  </div>
                )}
                
                {!freight.isLoading && freight.internacional && (
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distância (ida + volta):</span>
                      <span className="font-medium">{formatDistance(freight.distance_km!)} × 2 = {freight.internacional.round_trip_km} km</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Frete básico:</span>
                      <span>{formatCurrency(freight.internacional.freight_subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seguro (0,45%):</span>
                      <span>{formatCurrency(freight.internacional.insurance_amount)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base border-t pt-1 mt-1">
                      <span>Total Frete:</span>
                      <span className="text-purple-600">{formatCurrency(freight.internacional.total_freight_cost)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Frete por litro:</span>
                      <span>{formatCurrency(freight.internacional.freight_per_liter)}/L</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </RadioGroup>

          {!freight.isLoading && !primaryOrigin && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Selecione produtos com localização para calcular o frete
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
