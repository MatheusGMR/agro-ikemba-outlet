import { useOfertasCompra } from '@/hooks/useRevenda';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function RevendaOfertasCompra() {
  const { data: ofertas, isLoading } = useOfertasCompra();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>;
      case 'aprovada':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Aprovada</Badge>;
      case 'rejeitada':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Carregando ofertas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Minhas Ofertas de Compra</h2>
          <p className="text-muted-foreground">
            Acompanhe o status das suas ofertas enviadas
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {ofertas?.map((oferta) => (
          <Card key={oferta.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {oferta.produto_nome}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    SKU: {oferta.produto_sku} • Oferta criada em {new Date(oferta.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                {getStatusBadge(oferta.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Volume Solicitado</p>
                  <p className="font-semibold">{oferta.volume_desejado.toLocaleString()} L</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Preço Ofertado</p>
                  <p className="font-semibold">R$ {oferta.preco_ofertado.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Valor Total</p>
                  <p className="font-semibold">R$ {(oferta.volume_desejado * oferta.preco_ofertado).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Local de Entrega</p>
                  <p className="font-semibold">{oferta.cidade_entrega}/{oferta.estado_entrega}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Prazo Desejado</p>
                  <p className="font-semibold">{oferta.prazo_entrega_desejado} dias</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Validade da Oferta</p>
                  <p className="font-semibold">{new Date(oferta.validade_oferta).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-semibold capitalize">{oferta.status}</p>
                </div>
              </div>

              {oferta.observacoes && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Observações</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{oferta.observacoes}</p>
                </div>
              )}

              {oferta.resposta_fornecedor && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground">Resposta do Fornecedor</p>
                  <p className="text-sm bg-muted p-3 rounded-md">{oferta.resposta_fornecedor}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
                {oferta.status === 'pendente' && (
                  <Button size="sm" variant="outline">
                    Editar Oferta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Nenhuma oferta de compra enviada ainda. Explore o catálogo de produtos para fazer sua primeira oferta.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}