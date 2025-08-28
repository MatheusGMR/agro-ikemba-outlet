import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowUp, Calculator, TrendingUp } from 'lucide-react';
import type { PriceTierBenefit } from '@/types/inventory';

interface VolumeIncentiveProps {
  currentVolume: number;
  priceBenefits: PriceTierBenefit[];
  totalVolumeAvailable: number;
}

export function VolumeIncentive({ currentVolume, priceBenefits, totalVolumeAvailable }: VolumeIncentiveProps) {
  const bestPrice = priceBenefits.find(b => b.tier === 'Preço Unitário');
  const currentPrice = priceBenefits.find(b => b.tier === 'Preço Banda maior');
  
  if (!bestPrice || !currentPrice) return null;

  const potentialSavings = (currentPrice.price - bestPrice.price) * currentVolume;
  const nextTierVolume = 1000; // Example threshold
  const progressPercentage = Math.min((currentVolume / nextTierVolume) * 100, 100);

  return (
    <div className="space-y-4">
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <TrendingUp className="w-5 h-5" />
            Oportunidade de Economia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold text-orange-700">
            R$ {potentialSavings.toFixed(2)}
          </div>
          <p className="text-sm text-orange-600">
            Economia potencial ao acessar o preço unitário com seu volume atual
          </p>
          
          <Alert className="bg-orange-100 border-orange-200">
            <Calculator className="w-4 h-4" />
            <AlertDescription>
              <strong>Volume atual:</strong> {currentVolume.toLocaleString()}L<br />
              <strong>Preço atual:</strong> R$ {currentPrice.price.toFixed(2)}/L<br />
              <strong>Melhor preço:</strong> R$ {bestPrice.price.toFixed(2)}/L
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="w-5 h-5" />
            Aumente Seu Volume
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso para próxima faixa</span>
              <span>{Math.min(currentVolume, nextTierVolume).toLocaleString()}L de {nextTierVolume.toLocaleString()}L</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {currentVolume < nextTierVolume && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Faltam apenas {(nextTierVolume - currentVolume).toLocaleString()}L</strong> para acessar o preço intermediário!
              </p>
            </div>
          )}
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Volume total disponível:</p>
            <div className="text-lg font-bold text-green-600">
              {totalVolumeAvailable.toLocaleString()}L
            </div>
            <p className="text-xs text-muted-foreground">
              Nosso estoque pode atender grandes volumes com os melhores preços
            </p>
          </div>
          
          <Button className="w-full" size="sm">
            Solicitar Cotação para Volume Maior
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}