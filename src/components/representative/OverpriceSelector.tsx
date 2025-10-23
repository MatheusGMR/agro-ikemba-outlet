import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DollarSign, TrendingUp, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { calculateRepresentativeGain, formatCurrency } from '@/utils/commissionCalculator';

interface OverpriceSelectorProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: { percentage: number; amount: number }) => void;
  productName: string;
  precoAfiliado: number;
  precoBase?: number;
  estimatedVolume: number;
}

export const OverpriceSelector = ({
  open,
  onClose,
  onConfirm,
  productName,
  precoAfiliado,
  precoBase,
  estimatedVolume
}: OverpriceSelectorProps) => {
  const [mode, setMode] = useState<'percentage' | 'fixed'>('fixed');
  const [percentage, setPercentage] = useState(5);
  const [fixedValue, setFixedValue] = useState(0.50);

  const maxOverpricePercentage = 30;
  const maxOverpriceAmount = precoAfiliado * (maxOverpricePercentage / 100);

  // Calcular valores baseados no modo selecionado
  const calculatedAmount = useMemo(() => {
    if (mode === 'percentage') {
      return precoAfiliado * (percentage / 100);
    }
    return fixedValue;
  }, [mode, percentage, fixedValue, precoAfiliado]);

  const calculatedPercentage = useMemo(() => {
    if (mode === 'fixed') {
      return (fixedValue / precoAfiliado) * 100;
    }
    return percentage;
  }, [mode, fixedValue, percentage, precoAfiliado]);

  const precoFinal = precoAfiliado + calculatedAmount;
  const isOverLimit = calculatedPercentage > maxOverpricePercentage;
  const isAboveMarket = precoBase && precoFinal > precoBase;

  // Cálculos de ganho usando utility centralizada
  const calculation = calculateRepresentativeGain(
    precoAfiliado,
    calculatedAmount,
    1 // Por litro
  );

  const comissaoFixa = calculation.commission_fixed;
  const ganhoOverprice = calculation.overprice_gain;
  const ganhoTotal = calculation.total_gain;

  // Projeção para o volume estimado
  const ganhoTotalVolume = calculation.total_gain * estimatedVolume;
  const comissaoTotalVolume = calculation.commission_fixed * estimatedVolume;
  const overpriceGainVolume = calculation.overprice_gain * estimatedVolume;

  const economiaCliente = precoBase ? (precoBase - precoFinal) : 0;
  const percentualEconomia = precoBase ? ((economiaCliente / precoBase) * 100) : 0;

  const handleConfirm = () => {
    if (isOverLimit) return;
    
    onConfirm({
      percentage: calculatedPercentage,
      amount: calculatedAmount
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="h-6 w-6 text-primary" />
            Defina sua Margem de Ganho
          </DialogTitle>
          <DialogDescription>
            Configure o overprice para maximizar seus ganhos mantendo competitividade
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Info do Produto */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-base">{productName}</div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Preço Afiliado:</span>
                  <span className="font-medium">R$ {precoAfiliado.toFixed(2)}/L</span>
                </div>
                {precoBase && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço Médio de Mercado:</span>
                    <span className="font-medium">R$ {precoBase.toFixed(2)}/L</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Volume Estimado:</span>
                  <span>{estimatedVolume.toLocaleString()}L</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Seletor de Modo */}
          <div>
            <Label className="text-base">Tipo de Margem</Label>
            <RadioGroup value={mode} onValueChange={(value) => setMode(value as 'percentage' | 'fixed')} className="flex gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="percentage" id="percentage" />
                <Label htmlFor="percentage" className="cursor-pointer">Percentual</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed" className="cursor-pointer">Valor Fixo (R$/L)</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Input de Margem */}
          <div>
            <Label htmlFor="margin-input" className="text-base">
              {mode === 'percentage' ? 'Percentual de Margem' : 'Valor por Litro'}
            </Label>
            
            {mode === 'percentage' ? (
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-4">
                  <div className="w-32 text-right">
                    <Input
                      type="number"
                      value={percentage}
                      onChange={(e) => setPercentage(Math.min(Number(e.target.value), maxOverpricePercentage))}
                      className="text-right"
                      step="0.5"
                      min="0"
                      max={maxOverpricePercentage}
                    />
                  </div>
                  <span className="text-lg font-semibold">%</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  = R$ {calculatedAmount.toFixed(2)} por litro
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">R$</span>
                  <Input
                    id="margin-input"
                    type="number"
                    value={fixedValue}
                    onChange={(e) => setFixedValue(Math.min(Number(e.target.value), maxOverpriceAmount))}
                    step="0.10"
                    min="0"
                    max={maxOverpriceAmount}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground">por litro</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  = {calculatedPercentage.toFixed(1)}% de margem
                </div>
              </div>
            )}
          </div>

          {/* Alertas */}
          {isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Margem máxima permitida: {maxOverpricePercentage}%. Reduza o valor para continuar.
              </AlertDescription>
            </Alert>
          )}

          {isAboveMarket && !isOverLimit && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Atenção! Seu preço (R$ {precoFinal.toFixed(2)}) está acima do mercado (R$ {precoBase?.toFixed(2)}). 
                Isso pode dificultar o fechamento da venda.
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Resumo de Ganhos */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-300">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-green-800">
                <DollarSign className="h-5 w-5" />
                Resumo do seu Ganho
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Preço Final */}
              <div className="bg-white/60 p-3 rounded-md border border-green-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-green-700">Preço Final ao Cliente:</span>
                  <span className="text-xl font-bold text-green-900">
                    R$ {precoFinal.toFixed(2)}/L
                  </span>
                </div>
              </div>

              {/* Ganhos por Litro */}
              <div className="space-y-2 text-sm">
                <div className="font-medium text-green-800">Por litro vendido:</div>
                <div className="flex justify-between pl-4">
                  <span className="text-green-700">Comissão (1,5%):</span>
                  <span className="font-semibold">R$ {comissaoFixa.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pl-4">
                  <span className="text-green-700">Ganho da Margem (100%):</span>
                  <span className="font-semibold text-green-600">R$ {ganhoOverprice.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-green-800">
                  <span>Ganho Total/L:</span>
                  <span>R$ {ganhoTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Projeção Total */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-4 rounded-lg">
                <div className="text-xs uppercase tracking-wide opacity-90 mb-1">
                  Projeção para {estimatedVolume.toLocaleString()}L:
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Comissão:</span>
                    <span>R$ {comissaoTotalVolume.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ganho Margem:</span>
                    <span>R$ {overpriceGainVolume.toFixed(2)}</span>
                  </div>
                  <Separator className="bg-white/30" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">GANHO TOTAL:</span>
                    <span className="text-2xl font-bold">
                      R$ {ganhoTotalVolume.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Economia do Cliente */}
              {precoBase && economiaCliente > 0 && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-800">
                      <div className="font-medium mb-1">Economia do Cliente vs Mercado:</div>
                      <div className="font-semibold">
                        R$ {(economiaCliente * estimatedVolume).toFixed(2)} ({percentualEconomia.toFixed(1)}%)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dica */}
              <div className="bg-white/60 p-3 rounded-md border border-green-200">
                <p className="text-xs text-green-800 leading-relaxed">
                  💡 <strong>Dica:</strong> Você ganha 100% da margem aplicada + 1,5% de comissão fixa. 
                  Quanto maior a margem (até 30%), maior seu ganho. Mantenha a competitividade para fechar mais vendas!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isOverLimit}
              className="flex-1"
            >
              Confirmar Margem
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
