import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useProposalPublic, useApproveProposal, useRejectProposal } from '@/hooks/useProposal';
import { toast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, FileText, Building, User, Phone, Mail, Calendar, DollarSign, Loader2, AlertTriangle } from 'lucide-react';
import { ReservationExpiryAlert } from '@/components/representative/ReservationExpiryAlert';
import { RepresentativeService } from '@/services/representativeService';

export default function ProposalView() {
  const { publicLink } = useParams<{ publicLink: string }>();
  const { data: proposal, isLoading, error } = useProposalPublic(publicLink || '');
  const approveProposal = useApproveProposal();
  const rejectProposal = useRejectProposal();

  const [approvalData, setApprovalData] = useState({
    client_name: '',
    client_position: '',
    client_email: '',
    client_phone: '',
    comments: '',
    signature: null as string | null
  });

  const [rejectionComments, setRejectionComments] = useState('');
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleApprove = async () => {
    if (!proposal) return;

    // Check if reservation has expired
    if (proposal.reservation_status === 'expired') {
      toast({
        title: "Reserva Expirada",
        description: "Esta proposta perdeu a reserva de estoque. Entre em contato com o representante.",
        variant: "destructive"
      });
      return;
    }

    if (!approvalData.client_name || !approvalData.client_position) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e cargo são obrigatórios para aprovação",
        variant: "destructive"
      });
      return;
    }

    try {
      // Use RepresentativeService to approve and confirm reservation
      await RepresentativeService.approveProposal(proposal.id);

      // Also send approval data
      await approveProposal.mutateAsync({
        proposalId: proposal.id,
        approvalData
      });

      toast({
        title: "Proposta Aprovada!",
        description: "A proposta foi aprovada e o estoque foi reservado. O representante será notificado.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao aprovar proposta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async () => {
    if (!proposal) return;

    try {
      await rejectProposal.mutateAsync({
        proposalId: proposal.id,
        comments: rejectionComments
      });

      toast({
        title: "Proposta Rejeitada",
        description: "A proposta foi rejeitada. O representante será notificado.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao rejeitar proposta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Carregando proposta...</p>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Proposta não encontrada</h2>
            <p className="text-muted-foreground">
              {error?.message?.includes('No rows returned') 
                ? 'Esta proposta não existe ou o link pode estar incorreto.'
                : 'Erro ao carregar a proposta. Tente novamente mais tarde.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = new Date(proposal.validity_date) < new Date();
  const isReservationExpired = proposal.reservation_status === 'expired';
  const canInteract = !['approved', 'rejected'].includes(proposal.status) && !isExpired && !isReservationExpired;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <Badge variant={
            proposal.status === 'approved' ? 'default' :
            proposal.status === 'rejected' ? 'destructive' :
            isExpired ? 'secondary' : 'outline'
          }>
            {proposal.status === 'approved' && 'Aprovada'}
            {proposal.status === 'rejected' && 'Rejeitada'}
            {proposal.status === 'sent' && !isExpired && 'Aguardando Aprovação'}
            {proposal.status === 'viewed' && !isExpired && 'Visualizada'}
            {isExpired && 'Expirada'}
          </Badge>
        </div>

        {/* Reservation Alert */}
        {proposal.reservation_expires_at && (
          <ReservationExpiryAlert 
            expiresAt={proposal.reservation_expires_at}
            reservationStatus={proposal.reservation_status}
          />
        )}

        {/* Proposal Details */}
        <div className="grid gap-6">
          {/* Proposal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Detalhes da Proposta
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Número da Proposta</Label>
                <p className="font-semibold">{proposal.proposal_number}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Validade</Label>
                <p className="font-semibold">
                  {new Date(proposal.validity_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Valor Total</Label>
                <p className="font-semibold text-2xl text-primary">
                  R$ {proposal.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Frete</Label>
                <p className="font-semibold">
                  R$ {proposal.shipping_cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Client Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Empresa</Label>
                <p className="font-semibold">{proposal.opportunity?.client?.company_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Contato</Label>
                <p className="font-semibold">{proposal.opportunity?.client?.contact_name || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-semibold">{proposal.opportunity?.client?.email || 'Não informado'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <p className="font-semibold">{proposal.opportunity?.client?.phone || 'Não informado'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {proposal.opportunity?.items?.map((item, index) => (
                  <div key={item.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{item.product_name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {item.product_sku}</p>
                      <p className="text-sm">Quantidade: {item.quantity.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        R$ {item.total_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R$ {item.unit_price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / unidade
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Terms */}
          {(proposal.payment_terms || proposal.delivery_terms || proposal.observations) && (
            <Card>
              <CardHeader>
                <CardTitle>Condições</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {proposal.payment_terms && (
                  <div>
                    <Label className="text-muted-foreground">Condições de Pagamento</Label>
                    <p>{proposal.payment_terms}</p>
                  </div>
                )}
                {proposal.delivery_terms && (
                  <div>
                    <Label className="text-muted-foreground">Condições de Entrega</Label>
                    <p>{proposal.delivery_terms}</p>
                  </div>
                )}
                {proposal.observations && (
                  <div>
                    <Label className="text-muted-foreground">Observações</Label>
                    <p>{proposal.observations}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {canInteract && (
            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setShowApprovalForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Aprovar Proposta
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectionForm(true)}
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar Proposta
              </Button>
            </div>
          )}

          {/* Approval Form */}
          {showApprovalForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Aprovação da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client_name">Seu Nome Completo *</Label>
                    <Input
                      id="client_name"
                      value={approvalData.client_name}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, client_name: e.target.value }))}
                      placeholder="Nome completo"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_position">Cargo/Função *</Label>
                    <Input
                      id="client_position"
                      value={approvalData.client_position}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, client_position: e.target.value }))}
                      placeholder="Seu cargo na empresa"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_email">Email</Label>
                    <Input
                      id="client_email"
                      type="email"
                      value={approvalData.client_email}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, client_email: e.target.value }))}
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="client_phone">Telefone</Label>
                    <Input
                      id="client_phone"
                      value={approvalData.client_phone}
                      onChange={(e) => setApprovalData(prev => ({ ...prev, client_phone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="comments">Comentários (opcional)</Label>
                  <Textarea
                    id="comments"
                    value={approvalData.comments}
                    onChange={(e) => setApprovalData(prev => ({ ...prev, comments: e.target.value }))}
                    placeholder="Comentários adicionais sobre a aprovação..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={approveProposal.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {approveProposal.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Aprovando...
                      </>
                    ) : (
                      'Confirmar Aprovação'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejection Form */}
          {showRejectionForm && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Rejeição da Proposta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="rejection_comments">Motivo da Rejeição</Label>
                  <Textarea
                    id="rejection_comments"
                    value={rejectionComments}
                    onChange={(e) => setRejectionComments(e.target.value)}
                    placeholder="Informe o motivo da rejeição (opcional)..."
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowRejectionForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleReject}
                    disabled={rejectProposal.isPending}
                  >
                    {rejectProposal.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rejeitando...
                      </>
                    ) : (
                      'Confirmar Rejeição'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}