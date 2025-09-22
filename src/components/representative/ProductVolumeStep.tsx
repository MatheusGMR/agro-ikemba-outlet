import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Check, Package, AlertCircle } from 'lucide-react';
import { validateVolume } from '@/utils/validators';
import { toast } from 'sonner';

interface ProductVolumeData {
  volume: string;
  observacoes: string;
}

interface ProductVolumeStepProps {
  products: string[];
  volumeData: Record<string, ProductVolumeData>;
  onVolumeDataChange: (data: Record<string, ProductVolumeData>) => void;
  onBack: () => void;
  className?: string;
}

export function ProductVolumeStep({ 
  products, 
  volumeData, 
  onVolumeDataChange, 
  onBack, 
  className 
}: ProductVolumeStepProps) {
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [volumeError, setVolumeError] = useState('');

  const currentProduct = products[currentProductIndex];
  const currentData = volumeData[currentProduct] || { volume: '', observacoes: '' };
  
  const updateCurrentProduct = (field: keyof ProductVolumeData, value: string) => {
    const newVolumeData = {
      ...volumeData,
      [currentProduct]: {
        ...currentData,
        [field]: value
      }
    };
    onVolumeDataChange(newVolumeData);

    // Validar volume em tempo real
    if (field === 'volume') {
      if (value.trim() && !validateVolume(value)) {
        setVolumeError('Volume deve ser um número válido (ex: 30000, 30.000, 30,5)');
      } else {
        setVolumeError('');
      }
    }
  };

  const goToNext = () => {
    if (currentProductIndex < products.length - 1) {
      setCurrentProductIndex(currentProductIndex + 1);
      setVolumeError('');
    }
  };

  const goToPrevious = () => {
    if (currentProductIndex > 0) {
      setCurrentProductIndex(currentProductIndex - 1);
      setVolumeError('');
    }
  };

  const getProductStatus = (product: string) => {
    const data = volumeData[product];
    if (!data?.volume.trim()) return 'pending';
    if (!validateVolume(data.volume)) return 'error';
    return 'completed';
  };

  const completedProducts = products.filter(p => getProductStatus(p) === 'completed');
  const progress = (completedProducts.length / products.length) * 100;

  const isCurrentProductValid = currentData.volume.trim() && validateVolume(currentData.volume);

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Cabeçalho com progresso */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Volume Anual por Produto
              </h3>
              <p className="text-sm text-muted-foreground">
                Produto {currentProductIndex + 1} de {products.length}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {completedProducts.length}/{products.length} completos
              </div>
              <div className="text-xs text-green-600">
                {Math.round(progress)}% concluído
              </div>
            </div>
          </div>
          
          <Progress value={progress} className="h-2" />
        </div>

        {/* Card do produto atual */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-lg">{currentProduct}</h4>
                <p className="text-sm text-muted-foreground">
                  Informe o volume aproximado que você comercializa anualmente
                </p>
              </div>
              {isCurrentProductValid && (
                <div className="ml-auto p-1 bg-green-100 rounded-full">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="volume">Volume Aproximado Anual *</Label>
              <Input
                id="volume"
                value={currentData.volume}
                onChange={(e) => updateCurrentProduct('volume', e.target.value)}
                placeholder="Ex: 30.000, 50000, 25,5"
                className={volumeError ? 'border-red-500' : ''}
              />
              {volumeError && (
                <div className="flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="w-4 h-4" />
                  {volumeError}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                Use unidades como L (litros), Kg (quilogramas), ou números absolutos
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações (opcional)</Label>
              <Textarea
                id="observacoes"
                value={currentData.observacoes}
                onChange={(e) => updateCurrentProduct('observacoes', e.target.value)}
                placeholder="Informações adicionais sobre este produto..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de produtos com status */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status dos Produtos</Label>
          <div className="grid gap-2 max-h-32 overflow-y-auto">
            {products.map((product, index) => {
              const status = getProductStatus(product);
              const isCurrent = index === currentProductIndex;
              
              return (
                <div
                  key={product}
                  className={`flex items-center justify-between p-2 rounded-lg border text-sm transition-colors ${
                    isCurrent 
                      ? 'border-primary bg-primary/5' 
                      : status === 'completed'
                      ? 'border-green-200 bg-green-50'
                      : status === 'error'
                      ? 'border-red-200 bg-red-50'
                      : 'border-border bg-background'
                  }`}
                >
                  <span className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                    {product}
                  </span>
                  <div className="flex items-center gap-1">
                    {status === 'completed' && (
                      <Check className="w-4 h-4 text-green-600" />
                    )}
                    {status === 'error' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                    {isCurrent && (
                      <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navegação */}
        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onBack}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar aos Produtos
          </Button>
          
          <div className="flex gap-2">
            {currentProductIndex > 0 && (
              <Button
                variant="outline"
                onClick={goToPrevious}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
            )}
            
            {currentProductIndex < products.length - 1 ? (
              <Button
                onClick={goToNext}
                className="gap-2"
                disabled={!isCurrentProductValid && volumeError !== ''}
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={() => toast.success('Volumes configurados! Prossiga para o próximo step.')}
                className="gap-2"
                disabled={completedProducts.length === 0}
                variant={completedProducts.length === products.length ? "default" : "secondary"}
              >
                <Check className="w-4 h-4" />
                {completedProducts.length === products.length ? 'Finalizar' : `Continuar (${completedProducts.length}/${products.length})`}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}