import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCommissions, useCurrentRepresentative } from '@/hooks/useRepresentative';
import { formatCurrency } from '@/lib/utils';
import { Commission } from '@/types/representative';
import { Calendar, DollarSign, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';

const STATUS_LABELS = {
  pending: 'Pendente',
  invoiced: 'Faturado',
  paid: 'Pago'
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  invoiced: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800'
};

const STATUS_ICONS = {
  pending: Clock,
  invoiced: AlertCircle,
  paid: CheckCircle
};

interface CommissionCardProps {
  commission: Commission;
}

function CommissionCard({ commission }: CommissionCardProps) {
  const StatusIcon = STATUS_ICONS[commission.status];
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className="h-4 w-4" />
              <span className="font-semibold">
                {commission.order?.order_number || 'Comissão Avulsa'}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {commission.order?.client?.company_name}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs ${STATUS_COLORS[commission.status]}`}
          >
            {STATUS_LABELS[commission.status]}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-muted-foreground">Valor Base</p>
            <p className="font-semibold">{formatCurrency(commission.base_value)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Comissão ({commission.commission_percentage}%)</p>
            <p className="font-semibold text-primary">{formatCurrency(commission.commission_amount)}</p>
          </div>
        </div>

        <div className="space-y-2">
          {commission.due_date && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Vencimento: {new Date(commission.due_date).toLocaleDateString('pt-BR')}
            </div>
          )}
          
          {commission.paid_date && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              Pago em: {new Date(commission.paid_date).toLocaleDateString('pt-BR')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommissionTracker() {
  const { data: representative } = useCurrentRepresentative();
  const { data: commissions = [], isLoading } = useCommissions(representative?.id || '');

  if (isLoading) {
    return <div>Carregando comissões...</div>;
  }

  // Calcular estatísticas
  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const invoicedCommissions = commissions.filter(c => c.status === 'invoiced');
  const paidCommissions = commissions.filter(c => c.status === 'paid');

  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const totalInvoiced = invoicedCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commission_amount, 0);

  // Comissões do mês atual
  const currentMonth = new Date();
  currentMonth.setDate(1);
  const thisMonthCommissions = paidCommissions.filter(c => 
    new Date(c.paid_date || c.created_at) >= currentMonth
  );
  const thisMonthTotal = thisMonthCommissions.reduce((sum, c) => sum + c.commission_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Comissões & Ganhos</h2>
          <p className="text-muted-foreground">
            Acompanhe suas comissões e rendimentos
          </p>
        </div>
        
        <Button variant="outline">
          Gerar Relatório
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
                <p className="text-sm text-muted-foreground">Em Pipeline</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalInvoiced)}</p>
                <p className="text-sm text-muted-foreground">Faturado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(totalPaid)}</p>
                <p className="text-sm text-muted-foreground">Recebido</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{formatCurrency(thisMonthTotal)}</p>
                <p className="text-sm text-muted-foreground">Este Mês</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Commission List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {commissions.map(commission => (
          <CommissionCard key={commission.id} commission={commission} />
        ))}
      </div>

      {commissions.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma comissão encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Suas comissões aparecerão aqui conforme você fechar vendas
          </p>
        </div>
      )}
    </div>
  );
}