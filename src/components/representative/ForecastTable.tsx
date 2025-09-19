import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  const updateProduct = (produto: string, field: 'volume' | 'observacoes', value: string) => {
    const newForecast = {
      ...forecastData,
      [produto]: {
        ...forecastData[produto],
        [field]: value
      }
    };
    onUpdateForecast(newForecast);
  };

  const produtos = Object.keys(forecastData).filter(p => p.trim());

  if (produtos.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Volume Potencial Anual por Produto</h3>
      
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
                  <Input
                    placeholder="Ex: 30.000 L/ano"
                    value={forecastData[produto].volume}
                    onChange={(e) => updateProduct(produto, 'volume', e.target.value)}
                    className="min-w-[140px]"
                  />
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
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>
          <strong>Dica:</strong> Informe os volumes aproximados que você consegue comercializar anualmente. 
          Use unidades comuns como L (litros) ou Kg (quilogramas).
        </p>
      </div>
    </Card>
  );
}