import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

export default function TestMarketData() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const testFetchMarketData = async () => {
    setLoading(true);
    try {
      console.log('Calling fetch-market-data function...');
      
      const { data, error } = await supabase.functions.invoke('fetch-market-data', {
        body: {},
      });

      if (error) {
        console.error('Function call error:', error);
        throw error;
      }

      console.log('Function response:', data);
      setResult(data);
      
      toast({
        title: "Sucesso!",
        description: "Dados de mercado atualizados com sucesso",
      });
    } catch (error) {
      console.error('Error calling function:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar dados: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkTables = async () => {
    try {
      const [commodities, marketPrices] = await Promise.all([
        supabase.from('commodity_prices').select('*').limit(5),
        supabase.from('market_prices').select('*').limit(5)
      ]);

      console.log('Commodity prices:', commodities);
      console.log('Market prices:', marketPrices);
    } catch (error) {
      console.error('Error checking tables:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Market Data Function</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={testFetchMarketData} 
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Atualizando...' : 'Atualizar Dados de Mercado'}
          </Button>
          
          <Button 
            onClick={checkTables} 
            variant="outline"
            className="w-full"
          >
            Verificar Tabelas
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-muted rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}