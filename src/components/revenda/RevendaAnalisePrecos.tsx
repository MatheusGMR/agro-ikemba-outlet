import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Filter, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface MarketPrice {
  id: string;
  source_name: string;
  price: number;
  date: string;
  region: string;
  unit: string;
  currency: string;
  updated_at: string;
}

export default function RevendaAnalisePrecos() {
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');

  // Buscar dados de preços do mercado
  const { data: marketPrices, isLoading } = useQuery({
    queryKey: ['market-prices', selectedPeriod, selectedRegion],
    queryFn: async () => {
      let query = supabase
        .from('market_prices')
        .select('*')
        .order('date', { ascending: true });

      if (selectedRegion !== 'all') {
        query = query.eq('region', selectedRegion);
      }

      // Filtrar por período
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedPeriod));
      query = query.gte('date', daysAgo.toISOString().split('T')[0]);

      const { data, error } = await query;
      if (error) throw error;
      return data as MarketPrice[];
    },
  });

  // Buscar regiões disponíveis
  const { data: regions } = useQuery({
    queryKey: ['market-regions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('region')
        .not('region', 'is', null);
      
      if (error) throw error;
      
      const uniqueRegions = [...new Set(data.map(item => item.region))];
      return uniqueRegions;
    },
  });

  // Buscar produtos/fontes disponíveis
  const { data: products } = useQuery({
    queryKey: ['market-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_prices')
        .select('source_name')
        .not('source_name', 'is', null);
      
      if (error) throw error;
      
      const uniqueProducts = [...new Set(data.map(item => item.source_name))];
      return uniqueProducts;
    },
  });

  // Preparar dados para o gráfico
  const chartData = marketPrices?.reduce((acc, price) => {
    const date = price.date;
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      existingEntry[price.source_name] = price.price;
    } else {
      acc.push({
        date,
        [price.source_name]: price.price,
      });
    }
    
    return acc;
  }, [] as any[]) || [];

  // Calcular estatísticas
  const latestPrices = marketPrices?.reduce((acc, price) => {
    if (!acc[price.source_name] || new Date(price.date) > new Date(acc[price.source_name].date)) {
      acc[price.source_name] = price;
    }
    return acc;
  }, {} as Record<string, MarketPrice>) || {};

  const priceStats = Object.values(latestPrices).map(price => {
    const historicalPrices = marketPrices?.filter(p => p.source_name === price.source_name) || [];
    const previousPrice = historicalPrices[historicalPrices.length - 2];
    const trend = previousPrice ? price.price - previousPrice.price : 0;
    const trendPercent = previousPrice ? ((trend / previousPrice.price) * 100) : 0;

    return {
      ...price,
      trend,
      trendPercent,
    };
  });

  if (isLoading) {
    return <div>Carregando análise de preços...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Análise de Preços de Mercado</h2>
          <p className="text-muted-foreground">
            Acompanhe a evolução dos preços dos insumos agrícolas
          </p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Região</label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as regiões</SelectItem>
                  {regions?.map(region => (
                    <SelectItem key={region} value={region}>{region}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Produto</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products?.map(product => (
                    <SelectItem key={product} value={product}>{product}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas rápidas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {priceStats.slice(0, 4).map((stat) => (
          <Card key={stat.source_name}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.source_name}
                  </p>
                  <p className="text-lg font-bold">
                    R$ {stat.price.toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {stat.region} • {stat.unit}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {stat.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : stat.trend < 0 ? (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  ) : null}
                  <Badge variant={stat.trend > 0 ? 'default' : stat.trend < 0 ? 'destructive' : 'secondary'}>
                    {stat.trendPercent > 0 ? '+' : ''}{stat.trendPercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráfico de evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Evolução dos Preços
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                />
                <YAxis 
                  tickFormatter={(value) => `R$ ${value.toFixed(0)}`}
                />
                <Tooltip 
                  labelFormatter={(value) => new Date(value).toLocaleDateString('pt-BR')}
                  formatter={(value: any) => [`R$ ${value.toFixed(2)}`, 'Preço']}
                />
                <Legend />
                {Object.keys(latestPrices).slice(0, 5).map((productName, index) => (
                  <Line
                    key={productName}
                    type="monotone"
                    dataKey={productName}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                    connectNulls={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum dado de preço disponível para os filtros selecionados
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabela de preços detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Preços Atuais por Produto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {priceStats.map((stat) => (
              <div key={stat.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{stat.source_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {stat.region} • Atualizado em {new Date(stat.updated_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">R$ {stat.price.toFixed(2)}</p>
                  <div className="flex items-center gap-1">
                    {stat.trend > 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : stat.trend < 0 ? (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={`text-sm ${stat.trend > 0 ? 'text-green-600' : stat.trend < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {stat.trendPercent > 0 ? '+' : ''}{stat.trendPercent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}