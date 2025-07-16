import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, TrendingUp, TrendingDown, Target, BarChart3, ArrowUpDown, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AgriculturalInput {
  id: string;
  name: string;
  category: string;
  unit: string;
  manufacturer: string;
}

interface RegionalData {
  region_code: string;
  region_name: string;
  state: string;
  main_commodities: string[];
}

interface SimulationResult {
  id: string;
  calculatedPrice: number;
  marketMetrics: {
    regionalPrice: number;
    quotationPrice: number;
    historicalPrice: number;
    commodityPrice: number;
    marketPositioningPercentage: number;
    competitiveDifference: number;
    marketMarginPercentage: number;
    tradeRelationSimulated: number;
    tradeRelationMarket: number;
  };
}

const Simulador = () => {
  const { toast } = useToast();
  
  // Estados para dados
  const [inputs, setInputs] = useState<AgriculturalInput[]>([]);
  const [regions, setRegions] = useState<RegionalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    inputId: '',
    simulationName: '',
    purchaseCost: '',
    operationalExpenses: '',
    taxesPercentage: '',
    commissionsPercentage: '',
    targetMarginPercentage: '',
    region: '',
    commodityName: '',
    notes: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [inputsResponse, regionsResponse] = await Promise.all([
        supabase.from('agricultural_inputs').select('*').order('name'),
        supabase.from('regional_data').select('*').order('region_name')
      ]);

      if (inputsResponse.data) setInputs(inputsResponse.data);
      if (regionsResponse.data) setRegions(regionsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados iniciais",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMarketData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-market-data');
      
      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Dados de mercado atualizados com sucesso!"
      });
      
      console.log('Dados de mercado atualizados:', data);
    } catch (error) {
      console.error('Erro ao atualizar dados de mercado:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados de mercado",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSimulation = async () => {
    // Validações
    if (!formData.inputId || !formData.simulationName || !formData.purchaseCost || 
        !formData.targetMarginPercentage || !formData.region) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('calculate-simulation', {
        body: {
          inputId: formData.inputId,
          simulationName: formData.simulationName,
          purchaseCost: parseFloat(formData.purchaseCost),
          operationalExpenses: parseFloat(formData.operationalExpenses) || 0,
          taxesPercentage: parseFloat(formData.taxesPercentage) || 0,
          commissionsPercentage: parseFloat(formData.commissionsPercentage) || 0,
          targetMarginPercentage: parseFloat(formData.targetMarginPercentage),
          region: formData.region,
          commodityName: formData.commodityName || 'soja',
          notes: formData.notes
        }
      });

      if (error) throw error;

      setResult(data.simulation);
      toast({
        title: "Sucesso",
        description: "Simulação calculada com sucesso!"
      });

    } catch (error) {
      console.error('Erro na simulação:', error);
      toast({
        title: "Erro",
        description: "Erro ao calcular simulação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedInput = inputs.find(input => input.id === formData.inputId);
  const selectedRegion = regions.find(region => region.region_code === formData.region);

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Simulador de Preços - AgroIkemba</title>
        <meta name="description" content="Simulador estratégico de preços de insumos agrícolas com análise de mercado e benchmarking" />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">
                Simulador de Preços
              </h1>
              <p className="text-xl text-muted-foreground">
                Análise estratégica de preços de insumos agrícolas com benchmarking de mercado
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={updateMarketData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar Dados de Mercado
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulário de Configuração */}
          <div className="space-y-6">
            {/* Seção 1: Configuração do Produto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Configuração do Produto
                </CardTitle>
                <CardDescription>
                  Selecione o insumo agrícola e defina os parâmetros básicos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="simulationName">Nome da Simulação *</Label>
                  <Input
                    id="simulationName"
                    value={formData.simulationName}
                    onChange={(e) => handleInputChange('simulationName', e.target.value)}
                    placeholder="Ex: Análise Glifosato Janeiro 2025"
                  />
                </div>

                <div>
                  <Label htmlFor="inputId">Insumo Agrícola *</Label>
                  <Select value={formData.inputId} onValueChange={(value) => handleInputChange('inputId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      {inputs.map((input) => (
                        <SelectItem key={input.id} value={input.id}>
                          {input.name} - {input.category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedInput && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Unidade: {selectedInput.unit} | Fabricante: {selectedInput.manufacturer}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="region">Região *</Label>
                  <Select value={formData.region} onValueChange={(value) => handleInputChange('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma região" />
                    </SelectTrigger>
                    <SelectContent>
                      {regions.map((region) => (
                        <SelectItem key={region.region_code} value={region.region_code}>
                          {region.region_name} - {region.state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedRegion && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedRegion.main_commodities.map((commodity, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {commodity}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="commodityName">Commodity Principal</Label>
                  <Select value={formData.commodityName} onValueChange={(value) => handleInputChange('commodityName', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma commodity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soja">Soja</SelectItem>
                      <SelectItem value="milho">Milho</SelectItem>
                      <SelectItem value="algodao">Algodão</SelectItem>
                      <SelectItem value="cana">Cana-de-açúcar</SelectItem>
                      <SelectItem value="trigo">Trigo</SelectItem>
                      <SelectItem value="feijao">Feijão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Seção 2: Análise de Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Análise de Custos
                </CardTitle>
                <CardDescription>
                  Defina seus custos e margem de lucro desejada
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="purchaseCost">Custo de Compra (R$) *</Label>
                    <Input
                      id="purchaseCost"
                      type="number"
                      step="0.01"
                      value={formData.purchaseCost}
                      onChange={(e) => handleInputChange('purchaseCost', e.target.value)}
                      placeholder="Ex: 95.50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="operationalExpenses">Despesas Operacionais (R$)</Label>
                    <Input
                      id="operationalExpenses"
                      type="number"
                      step="0.01"
                      value={formData.operationalExpenses}
                      onChange={(e) => handleInputChange('operationalExpenses', e.target.value)}
                      placeholder="Ex: 5.20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="taxesPercentage">Impostos (%)</Label>
                    <Input
                      id="taxesPercentage"
                      type="number"
                      step="0.01"
                      value={formData.taxesPercentage}
                      onChange={(e) => handleInputChange('taxesPercentage', e.target.value)}
                      placeholder="Ex: 12.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="commissionsPercentage">Comissões (%)</Label>
                    <Input
                      id="commissionsPercentage"
                      type="number"
                      step="0.01"
                      value={formData.commissionsPercentage}
                      onChange={(e) => handleInputChange('commissionsPercentage', e.target.value)}
                      placeholder="Ex: 3.0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="targetMarginPercentage">Margem Alvo (%) *</Label>
                    <Input
                      id="targetMarginPercentage"
                      type="number"
                      step="0.01"
                      value={formData.targetMarginPercentage}
                      onChange={(e) => handleInputChange('targetMarginPercentage', e.target.value)}
                      placeholder="Ex: 20.0"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Notas adicionais sobre a simulação..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={calculateSimulation} 
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? 'Calculando...' : 'Calcular Simulação'}
            </Button>
          </div>

          {/* Resultados da Simulação */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Preço Calculado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Preço Calculado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-primary mb-2">
                        R$ {result.calculatedPrice.toFixed(2)}
                      </div>
                      <p className="text-muted-foreground">
                        por {selectedInput?.unit || 'unidade'}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Análise de Mercado */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Análise de Mercado
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Preço Regional (Tático)</p>
                        <p className="text-lg font-semibold">
                          {result.marketMetrics.regionalPrice > 0 
                            ? `R$ ${result.marketMetrics.regionalPrice.toFixed(2)}`
                            : <span className="text-muted-foreground">N/D</span>
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Preço de Cotação</p>
                        <p className="text-lg font-semibold">
                          {result.marketMetrics.quotationPrice > 0 
                            ? `R$ ${result.marketMetrics.quotationPrice.toFixed(2)}`
                            : <span className="text-muted-foreground">N/D</span>
                          }
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Posicionamento vs. Mercado</p>
                      <div className="flex items-center gap-2">
                        {result.marketMetrics.marketPositioningPercentage > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className={`font-semibold ${
                          result.marketMetrics.marketPositioningPercentage > 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {result.marketMetrics.marketPositioningPercentage > 0 ? '+' : ''}
                          {result.marketMetrics.marketPositioningPercentage.toFixed(2)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Diferença Competitiva</p>
                      <div className="flex items-center gap-2">
                        {result.marketMetrics.competitiveDifference > 0 ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        <span className={`font-semibold ${
                          result.marketMetrics.competitiveDifference > 0 ? 'text-red-500' : 'text-green-500'
                        }`}>
                          R$ {Math.abs(result.marketMetrics.competitiveDifference).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Relação de Troca */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ArrowUpDown className="h-5 w-5" />
                      Relação de Troca
                    </CardTitle>
                    <CardDescription>
                      Quantas sacas de commodity são necessárias para comprar 1 {selectedInput?.unit}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Seu Preço</p>
                        <p className="text-2xl font-bold text-primary">
                          {result.marketMetrics.tradeRelationSimulated.toFixed(3)}
                        </p>
                        <p className="text-xs text-muted-foreground">sacas/{selectedInput?.unit}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Mercado</p>
                        <p className="text-2xl font-bold text-muted-foreground">
                          {result.marketMetrics.tradeRelationMarket.toFixed(3)}
                        </p>
                        <p className="text-xs text-muted-foreground">sacas/{selectedInput?.unit}</p>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Preço da Commodity</p>
                      <p className="text-lg font-semibold">
                        {result.marketMetrics.commodityPrice > 0 
                          ? `R$ ${result.marketMetrics.commodityPrice.toFixed(2)}/saca`
                          : <span className="text-muted-foreground">N/D</span>
                        }
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Margem de Mercado */}
                <Card>
                  <CardHeader>
                    <CardTitle>Margem de Mercado</CardTitle>
                    <CardDescription>
                      Qual seria sua margem se vendesse ao preço regional
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${
                        result.marketMetrics.marketMarginPercentage >= parseFloat(formData.targetMarginPercentage) 
                          ? 'text-green-500' 
                          : 'text-red-500'
                      }`}>
                        {result.marketMetrics.marketMarginPercentage.toFixed(2)}%
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Meta: {formData.targetMarginPercentage}%
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Configure os parâmetros e clique em "Calcular Simulação" para ver os resultados</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Simulador;