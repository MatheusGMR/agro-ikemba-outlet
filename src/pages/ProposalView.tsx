import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, MessageSquare, FileText, MapPin, Phone, Mail } from 'lucide-react';
import { useProposalPublic, useApproveProposal, useRejectProposal } from '@/hooks/useProposal';

export default function ProposalView() {
  const { id } = useParams<{ id: string }>();
  const { data: proposal, isLoading, error } = useProposalPublic(id || '');
  const { mutate: approveProposal, isPending: isApproving } = useApproveProposal();
  const { mutate: rejectProposal, isPending: isRejecting } = useRejectProposal();

  const [clientData, setClientData] = useState({
    name: '',
    position: '',
    company: '',
    email: '',
    phone: ''
  });
  const [comments, setComments] = useState('');
  const [signature, setSignature] = useState<string | null>(null);

  useEffect(() => {
    // Mark as viewed when component loads
    if (proposal?.id) {
      // TODO: Implement view tracking
    }
  }, [proposal?.id]);

  const handleApprove = () => {
    if (!proposal?.id || !clientData.name || !clientData.position) return;
    
    approveProposal({
      proposalId: proposal.id,
      approvalData: {
        client_name: clientData.name,
        client_position: clientData.position,
        client_email: clientData.email,
        client_phone: clientData.phone,
        comments,
        signature
      }
    });
  };

  const handleReject = () => {
    if (!proposal?.id) return;
    
    rejectProposal({
      proposalId: proposal.id,
      comments
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-muted-foreground">
              A proposta que você está tentando acessar não existe ou expirou.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (proposal.status === 'approved') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta Aprovada</h2>
            <p className="text-muted-foreground">
              Esta proposta já foi aprovada em {new Date(proposal.client_approved_at || '').toLocaleDateString('pt-BR')}.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (proposal.status === 'rejected') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta Rejeitada</h2>
            <p className="text-muted-foreground">
              Esta proposta foi rejeitada.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date() > new Date(proposal.validity_date);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">AgroIkemba</h1>
              <p className="text-muted-foreground">Proposta Comercial</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold">#{proposal.proposal_number}</div>
              <Badge variant={isExpired ? "destructive" : "secondary"}>
                {isExpired ? 'Expirada' : 'Válida até ' + new Date(proposal.validity_date).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {isExpired && (
          <Alert variant="destructive">
            <AlertDescription>
              Esta proposta expirou em {new Date(proposal.validity_date).toLocaleDateString('pt-BR')}.
              Entre em contato conosco para uma nova proposta.
            </AlertDescription>
          </Alert>
        )}

        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Dados do Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="font-medium">{proposal.opportunity?.client?.company_name}</div>
                <div className="text-muted-foreground text-sm">{proposal.opportunity?.client?.cnpj_cpf}</div>
              </div>
              <div className="space-y-1">
                {proposal.opportunity?.client?.contact_name && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Contato:</span>
                    <span>{proposal.opportunity.client.contact_name}</span>
                  </div>
                )}
                {proposal.opportunity?.client?.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>{proposal.opportunity.client.phone}</span>
                  </div>
                )}
                {proposal.opportunity?.client?.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4" />
                    <span>{proposal.opportunity.client.email}</span>
                  </div>
                )}
                {proposal.opportunity?.client?.city && proposal.opportunity?.client?.state && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    <span>{proposal.opportunity.client.city}, {proposal.opportunity.client.state}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos e Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {proposal.opportunity?.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                  <div className="flex-1">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-sm text-muted-foreground">SKU: {item.product_sku}</div>
                    <div className="text-sm">
                      Quantidade: {item.quantity.toLocaleString()} • 
                      Preço unitário: R$ {item.unit_price.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">R$ {item.total_price.toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>R$ {proposal.total_value.toFixed(2)}</span>
              </div>
              {proposal.shipping_cost > 0 && (
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ {proposal.shipping_cost.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>R$ {(proposal.total_value + (proposal.shipping_cost || 0)).toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <Card>
          <CardHeader>
            <CardTitle>Condições Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {proposal.payment_terms && (
              <div className="flex justify-between">
                <span className="font-medium">Forma de Pagamento:</span>
                <span>{proposal.payment_terms}</span>
              </div>
            )}
            {proposal.delivery_terms && (
              <div className="flex justify-between">
                <span className="font-medium">Condições de Entrega:</span>
                <span>{proposal.delivery_terms}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-medium">Validade da Proposta:</span>
              <span>{new Date(proposal.validity_date).toLocaleDateString('pt-BR')}</span>
            </div>
            {proposal.observations && (
              <div>
                <div className="font-medium mb-1">Observações:</div>
                <div className="text-muted-foreground text-sm">{proposal.observations}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Form */}
        {!isExpired && proposal.status === 'sent' && (
          <Card>
            <CardHeader>
              <CardTitle>Responder à Proposta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={clientData.name}
                    onChange={(e) => setClientData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Seu nome completo"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="position">Cargo/Função *</Label>
                  <Input
                    id="position"
                    value={clientData.position}
                    onChange={(e) => setClientData(prev => ({ ...prev, position: e.target.value }))}
                    placeholder="Seu cargo na empresa"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={clientData.email}
                    onChange={(e) => setClientData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="seu@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={clientData.phone}
                    onChange={(e) => setClientData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="comments">Comentários</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Deixe seus comentários ou solicitações de alteração..."
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving || !clientData.name || !clientData.position}
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isApproving ? 'Aprovando...' : 'Aprovar Proposta'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleReject}
                  disabled={isRejecting}
                  className="flex-1"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="bg-muted mt-12 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© 2024 AgroIkemba. Todos os direitos reservados.</p>
          <p className="mt-1">Em caso de dúvidas, entre em contato conosco.</p>
        </div>
      </div>
    </div>
  );
}