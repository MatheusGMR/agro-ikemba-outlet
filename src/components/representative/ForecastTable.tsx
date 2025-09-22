import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { validateVolume, formatVolume } from '@/utils/validators';
import { AlertCircle } from 'lucide-react';

interface ForecastData {
  [produto: string]: {
    volume: string;
    observacoes: string;
  };
}

interface ForecastTableProps {
  forecastData: ForecastData;
  onUpdateForecast: (newForecast: ForecastData) => void;
}

export function ForecastTable({ forecastData, onUpdateForecast }: ForecastTableProps) {
  const [volumeErrors, setVolumeErrors] = useState<Record<string, string>>({});

  const updateProduct = (produto: string, field: 'volume' | 'observacoes', value: string) => {
    const newForecast = {
      ...forecastData,
      [produto]: {
        ...forecastData[produto],
        [field]: value
      }
    };
    onUpdateForecast(newForecast);

    // Validar volume em tempo real
    if (field === 'volume') {
      if (value.trim() && !validateVolume(value)) {
        setVolumeErrors(prev => ({
          ...prev,
          [produto]: 'Volume deve ser um número válido (ex: 30000, 30.000, 30,5)'
        }));
      } else {
        setVolumeErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[produto];
          return newErrors;
        });
      }
    }
  };

  const produtos = Object.keys(forecastData).filter(p => p.trim());
  const validProducts = produtos.filter(p => {
    const volume = forecastData[p].volume.trim();
    return volume && validateVolume(volume);
  });

  if (produtos.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Volume Potencial Anual por Produto</h3>
        <div className="text-sm text-muted-foreground">
          <span className={validProducts.length > 0 ? 'text-green-600' : 'text-amber-600'}>
            {validProducts.length}/{produtos.length} produtos válidos
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Produto</TableHead>
              <TableHead className="min-w-[150px]">Volume Aproximado Anual</TableHead>
              <TableHead className="min-w-[200px]">Observações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {produtos.map((produto) => (
              <TableRow key={produto}>
                <TableCell className="font-medium">
                  {produto}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Input
                      placeholder="Ex: 30.000 L/ano"
                      value={forecastData[produto].volume}
                      onChange={(e) => updateProduct(produto, 'volume', e.target.value)}
                      className={`min-w-[140px] ${volumeErrors[produto] ? 'border-red-500' : ''}`}
                    />
                    {volumeErrors[produto] && (
                      <div className="flex items-center gap-1 text-xs text-red-500">
                        <AlertCircle className="w-3 h-3" />
                        {volumeErrors[produto]}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Informações adicionais..."
                    value={forecastData[produto].observacoes}
                    onChange={(e) => updateProduct(produto, 'observacoes', e.target.value)}
                    rows={2}
                    className="min-w-[180px]"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 space-y-2">
        <div className="text-sm text-muted-foreground">
          <p>
            <strong>Dica:</strong> Informe os volumes aproximados que você consegue comercializar anualmente. 
            Use unidades comuns como L (litros), Kg (quilogramas), ou números absolutos.
          </p>
        </div>
        
        {validProducts.length > 0 && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>✓ Ótimo!</strong> Você já preencheu {validProducts.length} produto{validProducts.length > 1 ? 's' : ''} com volumes válidos.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}