import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingDown, Volume2, Target, Zap, Trophy } from 'lucide-react';
import type { InventoryItem } from '@/types/inventory';

interface DynamicPriceCardProps {
  inventoryItems: InventoryItem[];
  onVolumeChange?: (volume: number, price: number, savings: number) => void;
  minVolume?: number;
}

export function DynamicPriceCard({ 
  inventoryItems, 
  onVolumeChange,
  minVolume = 1000 
}: DynamicPriceCardProps) {
  const [selectedVolume, setSelectedVolume] = useState(minVolume);
  
  // Calculate price ranges
  const prices = inventoryItems.map(item => item.client_price);
  const maxPrice = Math.max(...prices); // Banda Maior
  const minPrice = Math.min(...prices); // Banda Menor (best price)
  const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length; // Unitário
  
  // Calculate total available volume
  const totalVolume = inventoryItems.reduce((sum, item) => sum + item.volume_available, 0);
  
  // Calculate current price based on volume
  const getCurrentPrice = (volume: number) => {
    const volumePercentage = volume / totalVolume;
    
    if (volume >= totalVolume) {
      return minPrice; // Banda Menor - best price at 100% volume
    } else if (volume >= totalVolume * 0.5) {
      // Linear interpolation between avgPrice and minPrice
      const factor = (volumePercentage - 0.5) / 0.5;
      return avgPrice - (avgPrice - minPrice) * factor;
    } else {
      // Linear interpolation between maxPrice and avgPrice
      const factor = volumePercentage / 0.5;
      return maxPrice - (maxPrice - avgPrice) * factor;
    }
  };
  
  const currentPrice = getCurrentPrice(selectedVolume);
  const savings = maxPrice - currentPrice;
  const savingsPercentage = ((maxPrice - currentPrice) / maxPrice) * 100;
  const progressToBandaMenor = Math.min((selectedVolume / totalVolume) * 100, 100);
  
  // Volume tier labels
  const getVolumeTier = (volume: number) => {
    const percentage = volume / totalVolume;
    if (percentage >= 1) return 'PREÇO BANDA MENOR';
    if (percentage >= 0.5) return 'PREÇO INTERMEDIÁRIO';
    return 'PREÇO INICIAL';
  };
  
  const getTierColor = (volume: number) => {
    const percentage = volume / totalVolume;
    if (percentage >= 1) return 'bg-green-100 text-green-800 border-green-200';
    if (percentage >= 0.5) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  // Notify parent of volume changes
  useEffect(() => {
    onVolumeChange?.(selectedVolume, currentPrice, savings);
  }, [selectedVolume, currentPrice, savings, onVolumeChange]);

  const handleVolumeChange = (value: number[]) => {
    setSelectedVolume(value[0]);
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
        {/* Price Display */}
        <div className="text-center p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          <div className="text-3xl font-bold text-primary mb-2">
            R$ {currentPrice.toFixed(2)}
            <span className="text-sm font-normal text-muted-foreground ml-1">/L</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Range: R$ {minPrice.toFixed(2)} - R$ {maxPrice.toFixed(2)} por litro
          </div>
        </div>

        {/* Volume Slider */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Volume Selecionado:</span>
            <span className="text-lg font-bold text-primary">
              {selectedVolume.toLocaleString('pt-BR')}L
            </span>
          </div>
          
          <Slider
            value={[selectedVolume]}
            onValueChange={handleVolumeChange}
            min={minVolume}
            max={totalVolume}
            step={100}
            className="w-full"
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Mín: {minVolume.toLocaleString('pt-BR')}L</span>
            <span>Máx: {totalVolume.toLocaleString('pt-BR')}L</span>
          </div>
        </div>

        {/* Savings Display */}
        {savings > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-800">Economia Conquistada</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-600">Valor poupado:</span>
                <div className="font-bold text-green-800">
                  R$ {(savings * selectedVolume).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>
              <div>
                <span className="text-green-600">Desconto:</span>
                <div className="font-bold text-green-800">
                  {savingsPercentage.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress to Banda Menor */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-primary" />
              Progresso para Melhor Preço
            </span>
            <span className="font-semibold">{progressToBandaMenor.toFixed(0)}%</span>
          </div>
          <Progress value={progressToBandaMenor} className="h-3" />
          
          {progressToBandaMenor < 100 && (
            <div className="text-xs text-muted-foreground">
              <Volume2 className="w-3 h-3 inline mr-1" />
              Faltam {(totalVolume - selectedVolume).toLocaleString('pt-BR')}L para o preço banda menor
            </div>
          )}
          
          {progressToBandaMenor >= 100 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Zap className="w-3 h-3" />
              Parabéns! Você desbloqueou o melhor preço disponível
            </div>
          )}
        </div>

        {/* Volume Incentive Messages */}
        <div className="text-center">
          {selectedVolume < totalVolume * 0.3 && (
            <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
              💡 <strong>Dica:</strong> Aumentando para {Math.ceil(totalVolume * 0.5).toLocaleString('pt-BR')}L, você economiza mais R$ {((avgPrice - getCurrentPrice(totalVolume * 0.5)) * selectedVolume).toFixed(2)}
            </div>
          )}
          
          {selectedVolume >= totalVolume * 0.3 && selectedVolume < totalVolume && (
            <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              🎯 <strong>Quase lá!</strong> Apenas {(totalVolume - selectedVolume).toLocaleString('pt-BR')}L para desbloquear o preço banda menor
            </div>
          )}
        </div>

        {/* Quick Volume Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedVolume(Math.ceil(totalVolume * 0.25))}
            className="text-xs"
          >
            25%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedVolume(Math.ceil(totalVolume * 0.5))}
            className="text-xs"
          >
            50%
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setSelectedVolume(totalVolume)}
            className="text-xs"
          >
            100%
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}