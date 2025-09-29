import { useState } from 'react';
import { useRevendaProdutos, useCreateRevendaProduto } from '@/hooks/useRevenda';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Package, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface ProdutoFormData {
  produto_sku: string;
  produto_nome: string;
  fabricante: string;
  ingrediente_ativo: string;
  categoria: string;
  volume_disponivel: number;
  unidade: string;
  preco_unitario: number;
  preco_minimo: number;
  cidade_origem: string;
  estado_origem: string;
  prazo_entrega_dias: number;
  data_validade: string;
  condicoes_armazenamento: string;
}

export default function RevendaProdutosManager() {
  const { data: produtos, isLoading } = useRevendaProdutos();
  const { mutate: createProduto, isPending } = useCreateRevendaProduto();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<ProdutoFormData>({
    defaultValues: {
      unidade: 'L',
      prazo_entrega_dias: 7,
    },
  });

  const onSubmit = (data: ProdutoFormData) => {
    createProduto({
      ...data,
      status: 'disponivel',
    }, {
      onSuccess: () => {
        setDialogOpen(false);
        form.reset();
      },
    });
  };

  if (isLoading) {
    return <div>Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Meus Produtos</h2>
          <p className="text-muted-foreground">
            Gerencie os produtos que você disponibiliza na plataforma
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Produto</DialogTitle>
              <DialogDescription>
                Preencha as informações do produto que deseja disponibilizar
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="produto_sku">SKU do Produto *</Label>
                  <Input
                    id="produto_sku"
                    {...form.register('produto_sku', { required: true })}
                    placeholder="Ex: HERB-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produto_nome">Nome do Produto *</Label>
                  <Input
                    id="produto_nome"
                    {...form.register('produto_nome', { required: true })}
                    placeholder="Nome do produto"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fabricante">Fabricante *</Label>
                  <Input
                    id="fabricante"
                    {...form.register('fabricante', { required: true })}
                    placeholder="Nome do fabricante"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ingrediente_ativo">Ingrediente Ativo</Label>
                  <Input
                    id="ingrediente_ativo"
                    {...form.register('ingrediente_ativo')}
                    placeholder="Princípio ativo"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <select
                    id="categoria"
                    {...form.register('categoria', { required: true })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Selecione...</option>
                    <option value="Herbicida">Herbicida</option>
                    <option value="Fungicida">Fungicida</option>
                    <option value="Inseticida">Inseticida</option>
                    <option value="Fertilizante">Fertilizante</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="volume_disponivel">Volume Disponível *</Label>
                  <Input
                    id="volume_disponivel"
                    type="number"
                    {...form.register('volume_disponivel', { required: true, valueAsNumber: true })}
                    placeholder="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unidade">Unidade</Label>
                  <select
                    id="unidade"
                    {...form.register('unidade')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="L">Litros (L)</option>
                    <option value="KG">Quilogramas (KG)</option>
                    <option value="T">Toneladas (T)</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="preco_unitario">Preço Unitário (R$) *</Label>
                  <Input
                    id="preco_unitario"
                    type="number"
                    step="0.01"
                    {...form.register('preco_unitario', { required: true, valueAsNumber: true })}
                    placeholder="25.50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preco_minimo">Preço Mínimo (R$)</Label>
                  <Input
                    id="preco_minimo"
                    type="number"
                    step="0.01"
                    {...form.register('preco_minimo', { valueAsNumber: true })}
                    placeholder="20.00"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="cidade_origem">Cidade *</Label>
                  <Input
                    id="cidade_origem"
                    {...form.register('cidade_origem', { required: true })}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado_origem">Estado *</Label>
                  <Input
                    id="estado_origem"
                    {...form.register('estado_origem', { required: true })}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prazo_entrega_dias">Prazo Entrega (dias)</Label>
                  <Input
                    id="prazo_entrega_dias"
                    type="number"
                    {...form.register('prazo_entrega_dias', { valueAsNumber: true })}
                    placeholder="7"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data_validade">Data de Validade *</Label>
                  <Input
                    id="data_validade"
                    type="date"
                    {...form.register('data_validade', { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="condicoes_armazenamento">Condições de Armazenamento</Label>
                  <Input
                    id="condicoes_armazenamento"
                    {...form.register('condicoes_armazenamento')}
                    placeholder="Temperatura ambiente, local seco..."
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={isPending}>
                  {isPending ? 'Salvando...' : 'Adicionar Produto'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {produtos?.map((produto) => (
          <Card key={produto.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {produto.produto_nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    SKU: {produto.produto_sku} • {produto.fabricante}
                  </p>
                </div>
                <Badge variant={produto.status === 'disponivel' ? 'default' : 'secondary'}>
                  {produto.status === 'disponivel' ? 'Disponível' : 'Indisponível'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-semibold">{produto.volume_disponivel.toLocaleString()} {produto.unidade}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço</p>
                  <p className="font-semibold">R$ {produto.preco_unitario.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Localização</p>
                  <p className="font-semibold">{produto.cidade_origem}/{produto.estado_origem}</p>
                </div>
              </div>
              
              {produto.ingrediente_ativo && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">Ingrediente Ativo</p>
                  <p className="text-sm">{produto.ingrediente_ativo}</p>
                </div>
              )}

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto cadastrado ainda. Comece adicionando seu primeiro produto.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}