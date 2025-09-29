import { useState } from 'react';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import { useCreateOfertaCompra } from '@/hooks/useRevenda';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Search, MapPin, Calendar, Package, ShoppingCart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface OfertaFormData {
  volume_desejado: number;
  preco_ofertado: number;
  cidade_entrega: string;
  estado_entrega: string;
  prazo_entrega_desejado: number;
  observacoes: string;
  validade_oferta: string;
}

export default function RevendaCatalogo() {
  const { data: produtos, isLoading } = useGroupedProductsForSales();
  const { mutate: createOferta, isPending } = useCreateOfertaCompra();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [ofertaDialogOpen, setOfertaDialogOpen] = useState(false);

  const form = useForm<OfertaFormData>({
    defaultValues: {
      prazo_entrega_desejado: 15,
      validade_oferta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    },
  });

  const filteredProducts = produtos?.filter(produto =>
    produto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    produto.active_ingredient?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmitOferta = (data: OfertaFormData) => {
    if (!selectedProduct) return;

    createOferta({
      produto_sku: selectedProduct.sku,
      produto_nome: selectedProduct.name,
      ...data,
      status: 'pendente',
    }, {
      onSuccess: () => {
        setOfertaDialogOpen(false);
        setSelectedProduct(null);
        form.reset();
        toast.success('Oferta de compra enviada com sucesso!');
      },
    });
  };

  const handleCreateOferta = (produto: any) => {
    setSelectedProduct(produto);
    setOfertaDialogOpen(true);
  };

  if (isLoading) {
    return <div>Carregando catálogo...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Catálogo de Produtos</h2>
          <p className="text-muted-foreground">
            Explore produtos disponíveis e faça ofertas de compra
          </p>
        </div>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por produto, fabricante ou ingrediente ativo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de produtos */}
      <div className="grid gap-4">
        {filteredProducts.map((produto) => (
          <Card key={produto.sku} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {produto.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {produto.manufacturer} • SKU: {produto.sku}
                  </p>
                  {produto.active_ingredient && (
                    <p className="text-sm text-muted-foreground">
                      Ingrediente Ativo: {produto.active_ingredient}
                    </p>
                  )}
                </div>
                <Badge variant="secondary">
                  {produto.locations_count} localidade{produto.locations_count > 1 ? 's' : ''}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Volume Total</p>
                  <p className="font-semibold">{produto.total_volume.toLocaleString()} L</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço Unitário</p>
                  <p className="font-semibold">R$ {produto.main_item.preco_unitario?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização Principal</p>
                  <p className="font-semibold flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {produto.main_item.city}/{produto.main_item.state}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Validade</p>
                  <p className="font-semibold flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(produto.main_item.expiry_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Faixas de preço */}
              {produto.all_items.length > 1 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Faixas de Preço Disponíveis:</p>
                  <div className="flex gap-2 flex-wrap">
                    {produto.all_items.map((item, index) => (
                      <Badge key={index} variant="outline">
                        {item.preco_banda_menor && item.preco_banda_maior ? 
                          `R$ ${item.preco_banda_menor.toFixed(2)} - R$ ${item.preco_banda_maior.toFixed(2)}` :
                          `R$ ${item.preco_unitario?.toFixed(2) || 'N/A'}`
                        }
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleCreateOferta(produto)}
                  className="flex items-center gap-2"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Fazer Oferta
                </Button>
                <Button variant="outline">
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredProducts.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {searchTerm ? 'Nenhum produto encontrado para sua busca.' : 'Nenhum produto disponível no momento.'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para criar oferta */}
      <Dialog open={ofertaDialogOpen} onOpenChange={setOfertaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fazer Oferta de Compra</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>Produto: {selectedProduct.name} ({selectedProduct.sku})</>
              )}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmitOferta)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="volume_desejado">Volume Desejado (L) *</Label>
                <Input
                  id="volume_desejado"
                  type="number"
                  {...form.register('volume_desejado', { required: true, valueAsNumber: true })}
                  placeholder="1000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preco_ofertado">Preço Ofertado (R$) *</Label>
                <Input
                  id="preco_ofertado"
                  type="number"
                  step="0.01"
                  {...form.register('preco_ofertado', { required: true, valueAsNumber: true })}
                  placeholder="25.50"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cidade_entrega">Cidade de Entrega *</Label>
                <Input
                  id="cidade_entrega"
                  {...form.register('cidade_entrega', { required: true })}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado_entrega">Estado *</Label>
                <Input
                  id="estado_entrega"
                  {...form.register('estado_entrega', { required: true })}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="prazo_entrega_desejado">Prazo Desejado (dias)</Label>
                <Input
                  id="prazo_entrega_desejado"
                  type="number"
                  {...form.register('prazo_entrega_desejado', { valueAsNumber: true })}
                  placeholder="15"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validade_oferta">Validade da Oferta *</Label>
                <Input
                  id="validade_oferta"
                  type="date"
                  {...form.register('validade_oferta', { required: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...form.register('observacoes')}
                placeholder="Informações adicionais sobre a oferta..."
                rows={3}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enviando...' : 'Enviar Oferta'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOfertaDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}