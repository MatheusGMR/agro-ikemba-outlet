import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { PriceDisplay } from '@/components/ui/PriceDisplay';
import { ConversionModal } from '@/components/ui/ConversionModal';
import { Target, TrendingUp, Volume2, Lock } from 'lucide-react';
import { useUserApproval } from '@/hooks/useUserApproval';
import { useAuth } from '@/hooks/useAuth';
import { useVolumeAnalytics } from '@/hooks/useAnalytics';
import type { InventoryItem } from '@/types/inventory';

interface DynamicPriceCardProps {
  inventoryItems: InventoryItem[];
  onVolumeChange?: (volume: number, price: number, savings: number) => void;
  onVolumeCommit?: (volume: number, price: number, savings: number) => void;
  minVolume?: number;
  initialVolumePercentage?: number;
}

export default function DynamicPriceCard({ 
  inventoryItems, 
  onVolumeChange, 
  onVolumeCommit, 
  minVolume = 20, 
  initialVolumePercentage = 100 
}: DynamicPriceCardProps) {
  const totalAvailable = inventoryItems.reduce((sum, item) => sum + item.available_volume, 0);
  const initialVolume = Math.max(minVolume, Math.ceil(totalAvailable * (initialVolumePercentage / 100)));
  const [selectedVolume, setSelectedVolume] = useState(initialVolume);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const { user } = useAuth();
  const { isApproved, isPending } = useUserApproval();
  
  // Analytics and session tracking
  const productSku = inventoryItems[0]?.product_sku;
  const { startVolumeSession, trackVolumeOptimization } = useVolumeAnalytics(productSku);
  const sessionStarted = useRef(false);
  const lastCommittedVolume = useRef(initialVolume);
  const sessionStartTime = useRef(Date.now());
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  
  const priceRange = useMemo(() => {
    if (!inventoryItems.length) return { min: 0, max: 0 };
    
    const firstItem = inventoryItems[0];
    const prices = [
      firstItem.base_price,
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

  // Initialize analytics session when component mounts
  useEffect(() => {
    if (isApproved && productSku && !sessionStarted.current) {
      startVolumeSession(initialVolume, getCurrentPrice(initialVolume));
      sessionStarted.current = true;
      sessionStartTime.current = Date.now();
    }
  }, [isApproved, productSku, initialVolume, startVolumeSession]);

  // Immediate UI callback (for real-time price updates)
  useEffect(() => {
    onVolumeChange?.(selectedVolume, currentPrice, savings);
  }, [selectedVolume, currentPrice, savings, onVolumeChange]);

  // Debounced analytics tracking
  const trackVolumeCommit = useCallback((finalVolume: number) => {
    if (!isApproved || !productSku) return;
    
    const finalPrice = getCurrentPrice(finalVolume);
    const volumeChange = Math.abs(finalVolume - lastCommittedVolume.current);
    const volumeChangePercentage = (volumeChange / totalAvailable) * 100;
    const timeSpent = Math.floor((Date.now() - sessionStartTime.current) / 1000);
    
    // Only track if significant change (>5% of total or >100L) and spent >2 seconds
    if ((volumeChangePercentage > 5 || volumeChange > 100) && timeSpent > 2) {
      const reachedBandaMenor = finalVolume >= totalAvailable * 0.8;
      
      trackVolumeOptimization(
        finalVolume,
        finalPrice,
        reachedBandaMenor
      );
      
      // Call the commit callback
      onVolumeCommit?.(finalVolume, finalPrice, savings);
      
      lastCommittedVolume.current = finalVolume;
      sessionStartTime.current = Date.now(); // Reset session for next interaction
    }
  }, [isApproved, productSku, totalAvailable, trackVolumeOptimization, onVolumeCommit, getCurrentPrice, savings]);

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setSelectedVolume(newVolume);
    
    // Debounce the analytics tracking (800ms)
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    debounceTimeoutRef.current = setTimeout(() => {
      trackVolumeCommit(newVolume);
    }, 800);
  };

  const handleSliderInteraction = () => {
    // Allow all users to interact with slider for simulation
  };

  // Track on mouse/touch up for immediate commits
  const handleVolumeCommitImmediate = useCallback(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    trackVolumeCommit(selectedVolume);
  }, [selectedVolume, trackVolumeCommit]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

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
              onValueCommit={handleVolumeCommitImmediate}
              max={totalAvailable}
              min={minVolume}
              step={20}
              className="w-full"
            />
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Min: {minVolume.toLocaleString()}L</span>
            <span>Max: {totalAvailable.toLocaleString()}L</span>
          </div>
          
          {!isApproved && (
            <div className="text-center text-sm text-muted-foreground p-2 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <TrendingUp className="w-4 h-4 text-green-600 mx-auto mb-1" />
              <span className="text-green-700 font-medium">
                Simulação liberada! Mova a barra para ver preços em tempo real
              </span>
            </div>
          )}
        </div>

        {/* Savings Display - Show for all users */}
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
            {!isApproved && (
              <div className="text-xs text-primary mt-1">
                💡 Cadastre-se para comprar com estes preços
              </div>
            )}
          </div>
        </div>

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
          <div className="text-center p-3 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-green-700 font-medium mb-1">
              Próximo passo: finalizar sua compra
            </p>
            <p className="text-xs text-green-600">
              Para comprar com estes preços simulados, faça seu cadastro gratuito
            </p>
          </div>
        )}

        {/* Quick Volume Actions - Only for approved users */}
        {isApproved && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newVolume = Math.ceil(totalAvailable * 0.25);
                setSelectedVolume(newVolume);
                trackVolumeCommit(newVolume);
              }}
              className="text-xs"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newVolume = Math.ceil(totalAvailable * 0.5);
                setSelectedVolume(newVolume);
                trackVolumeCommit(newVolume);
              }}
              className="text-xs"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newVolume = totalAvailable;
                setSelectedVolume(newVolume);
                trackVolumeCommit(newVolume);
              }}
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