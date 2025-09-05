import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ConversionModal } from '@/components/ui/ConversionModal';
import { Target, TrendingUp, Volume2, Lock } from 'lucide-react';
import { useUserApproval } from '@/hooks/useUserApproval';
import { useAuth } from '@/hooks/useAuth';
import type { InventoryItem } from '@/types/inventory';

interface DynamicPriceCardProps {
  inventoryItems: InventoryItem[];
  onVolumeChange?: (volume: number, price: number, savings: number) => void;
  minVolume?: number;
  initialVolumePercentage?: number;
}

export default function DynamicPriceCard({ inventoryItems, onVolumeChange, minVolume = 20, initialVolumePercentage = 100 }: DynamicPriceCardProps) {
  const totalAvailable = inventoryItems.reduce((sum, item) => sum + item.volume_available, 0);
  const initialVolume = Math.max(minVolume, Math.ceil(totalAvailable * (initialVolumePercentage / 100)));
  const [selectedVolume, setSelectedVolume] = useState(initialVolume);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const { user } = useAuth();
  const { isApproved, isPending } = useUserApproval();
  
  const priceRange = useMemo(() => {
    if (!inventoryItems.length) return { min: 0, max: 0 };
    
    const firstItem = inventoryItems[0];
    const prices = [
      firstItem.preco_unitario,
      firstItem.preco_banda_menor,
      firstItem.preco_banda_maior
    ];
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [inventoryItems]);

  // totalAvailable already calculated above
  const maxPrice = priceRange.max;
  const minPrice = priceRange.min;

  // Calculate current price based on volume (linear interpolation)
  const getCurrentPrice = (volume: number) => {
    const volumeRatio = Math.min(volume / totalAvailable, 1);
    return maxPrice - (maxPrice - minPrice) * volumeRatio;
  };

  const currentPrice = getCurrentPrice(selectedVolume);
  const savings = (maxPrice - currentPrice) * selectedVolume;

  // Determine price tier based on volume
  const getVolumeTier = (volume: number) => {
    const ratio = volume / totalAvailable;
    if (ratio >= 0.8) return "PREÇO BANDA MENOR";
    if (ratio >= 0.5) return "PREÇO INTERMEDIÁRIO";
    return "PREÇO INICIAL";
  };

  const getTierColor = (volume: number) => {
    const ratio = volume / totalAvailable;
    if (ratio >= 0.8) return "bg-green-100 text-green-800 border-green-200";
    if (ratio >= 0.5) return "bg-blue-100 text-blue-800 border-blue-200";
    return "bg-orange-100 text-orange-800 border-orange-200";
  };

  useEffect(() => {
    onVolumeChange?.(selectedVolume, currentPrice, savings);
  }, [selectedVolume, currentPrice, savings, onVolumeChange]);

  const handleVolumeChange = (value: number[]) => {
    if (!isApproved) {
      setShowConversionModal(true);
      return;
    }
    setSelectedVolume(value[0]);
  };

  const handleSliderInteraction = () => {
    if (!isApproved) {
      setShowConversionModal(true);
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-muted/20">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span>Simulador de Volume e Preços</span>
          </div>
          <Badge className={getTierColor(selectedVolume)}>
            {getVolumeTier(selectedVolume)}
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Price Display - Always show prices now */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <PriceDisplay price={currentPrice} size="lg" showUnit={true} className="justify-center" />
          <div className="text-sm text-muted-foreground">
            Range: R$ {minPrice.toFixed(2)} - R$ {maxPrice.toFixed(2)} por litro
          </div>
          {!isApproved && (
            <div className="text-xs text-primary mt-2">
              💡 Cadastre-se para usar o simulador interativo
            </div>
          )}
        </div>

        {/* Volume Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Volume Desejado</label>
            <span className="text-sm font-semibold text-primary">
              {selectedVolume.toLocaleString()} L
            </span>
          </div>
          
          <div className="relative">
            <Slider
              value={[selectedVolume]}
              onValueChange={handleVolumeChange}
              max={totalAvailable}
              min={minVolume}
              step={20}
              className="w-full"
              disabled={!isApproved}
            />
            {!isApproved && (
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={handleSliderInteraction}
              />
            )}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {minVolume.toLocaleString()}L</span>
            <span>Max: {totalAvailable.toLocaleString()}L</span>
          </div>
          
          {!isApproved && (
            <div 
              className="flex items-center justify-center gap-2 text-sm bg-gradient-to-r from-primary/10 to-primary/5 p-3 rounded-lg border border-primary/20 cursor-pointer hover:from-primary/15 hover:to-primary/10 transition-colors"
              onClick={handleSliderInteraction}
            >
              <Target className="w-4 h-4 text-primary" />
              <span className="text-primary font-medium">
                Clique para simular volumes e descobrir descontos
              </span>
            </div>
          )}
        </div>

        {/* Savings Display - Only for approved users */}
        {isApproved && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">Economia Total</span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                R$ {savings.toFixed(2)}
              </div>
              <div className="text-xs text-green-600">
                ({((savings / (maxPrice * selectedVolume)) * 100).toFixed(1)}% de desconto)
              </div>
            </div>
          </div>
        )}

        {/* Volume Incentive Message - Only for approved users */}
        {isApproved ? (
          <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Volume2 className="w-5 h-5 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-blue-800 font-medium mb-1">
              {selectedVolume < totalAvailable * 0.5 
                ? "Aumente o volume para melhores preços!" 
                : selectedVolume < totalAvailable * 0.8
                  ? "Ótimo volume de compra!"
                  : "Máxima economia atingida!"
              }
            </p>
            <p className="text-xs text-blue-600">
              Volume restante até Banda Menor: {Math.max(0, totalAvailable - selectedVolume).toLocaleString()}L
            </p>
          </div>
        ) : (
          <div 
            className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg cursor-pointer hover:from-green-100 hover:to-blue-100 transition-colors"
            onClick={handleSliderInteraction}
          >
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium mb-1">
              Descontos progressivos por volume
            </p>
            <p className="text-xs text-green-600">
              Cadastre-se e descubra até 15% de economia em compras maiores
            </p>
          </div>
        )}

        {/* Quick Volume Actions - Only for approved users */}
        {isApproved && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVolume(Math.ceil(totalAvailable * 0.25))}
              className="text-xs"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVolume(Math.ceil(totalAvailable * 0.5))}
              className="text-xs"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVolume(totalAvailable)}
              className="text-xs"
            >
              100%
            </Button>
          </div>
        )}
      </CardContent>

      <ConversionModal 
        open={showConversionModal}
        onOpenChange={setShowConversionModal}
        featureRequested="O simulador de preços"
      />
    </Card>
  );
}