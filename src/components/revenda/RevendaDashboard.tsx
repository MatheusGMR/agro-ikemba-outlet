import { useState } from 'react';
import { useCurrentRevenda, useRevendaDashboardStats } from '@/hooks/useRevenda';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Package, 
  TrendingUp, 
  FileText, 
  Plus,
  BarChart3,
  ShoppingCart,
  Warehouse
} from 'lucide-react';
import RevendaHeader from './RevendaHeader';
import RevendaProdutosManager from './RevendaProdutosManager';
import RevendaAnalisePrecos from './RevendaAnalisePrecos';
import RevendaCatalogo from './RevendaCatalogo';
import RevendaOfertasCompra from './RevendaOfertasCompra';
import RevendaPerfilForm from './RevendaPerfilForm';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

export default function RevendaDashboard() {
  const { data: revenda, isLoading: revendaLoading } = useCurrentRevenda();
  const { data: stats, isLoading: statsLoading } = useRevendaDashboardStats();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (revendaLoading) {
    return <LoadingFallback />;
  }

  if (!revenda) {
    // Primeira vez - mostrar formulário de configuração
    return (
      <div className="min-h-screen bg-background">
        <RevendaHeader revenda={null} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Configure sua Revenda
                </CardTitle>
                <CardDescription>
                  Complete os dados da sua empresa para começar a usar a plataforma
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevendaPerfilForm />
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <RevendaHeader revenda={revenda} />
      
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="mercado" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Mercado
            </TabsTrigger>
            <TabsTrigger value="catalogo" className="flex items-center gap-2">
              <Warehouse className="h-4 w-4" />
              Catálogo
            </TabsTrigger>
            <TabsTrigger value="ofertas" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Ofertas
            </TabsTrigger>
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Perfil
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Meus Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '-' : stats?.totalProdutos || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    produtos cadastrados
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Volume Total</CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '-' : `${stats?.volumeTotal?.toLocaleString() || 0}L`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    disponível para venda
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ofertas Pendentes</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '-' : stats?.ofertasPendentes || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    aguardando resposta
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ofertas Aprovadas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statsLoading ? '-' : stats?.ofertasAprovadas || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    negócios fechados
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ações Rápidas</CardTitle>
                  <CardDescription>
                    Acesse rapidamente as funcionalidades principais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab('produtos')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('catalogo')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Warehouse className="h-4 w-4 mr-2" />
                    Explorar Catálogo
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('mercado')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Analisar Mercado
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Razão Social:</span>
                    <span className="text-sm font-medium">{revenda.razao_social}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">CNPJ:</span>
                    <span className="text-sm font-medium">{revenda.cnpj}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Localização:</span>
                    <span className="text-sm font-medium">{revenda.cidade}/{revenda.estado}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <Badge variant={revenda.status === 'active' ? 'default' : 'secondary'}>
                      {revenda.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="produtos">
            <RevendaProdutosManager />
          </TabsContent>

          <TabsContent value="mercado">
            <RevendaAnalisePrecos />
          </TabsContent>

          <TabsContent value="catalogo">
            <RevendaCatalogo />
          </TabsContent>

          <TabsContent value="ofertas">
            <RevendaOfertasCompra />
          </TabsContent>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Revenda</CardTitle>
                <CardDescription>
                  Gerencie as informações da sua empresa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RevendaPerfilForm />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}