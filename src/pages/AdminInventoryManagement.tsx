import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAllReservations, useCancelReservation, useReservationStats } from '@/hooks/useInventoryReservations';
import { Package, Lock, AlertTriangle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { StockAvailabilityBadge } from '@/components/inventory/StockAvailabilityBadge';

export default function AdminInventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: inventoryReport = [], isLoading: loadingInventory } = useQuery({
    queryKey: ['inventory-reservations-report'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_reservations_report')
        .select('*')
        .order('product_name');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: reservations = [], isLoading: loadingReservations } = useAllReservations();
  const { data: stats } = useReservationStats();
  const cancelReservation = useCancelReservation();

  const handleCancelReservation = async (proposalId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta reserva?')) return;

    try {
      await cancelReservation.mutateAsync(proposalId);
      toast({
        title: "Reserva cancelada",
        description: "A reserva foi cancelada e o estoque voltou a ficar disponível",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao cancelar reserva",
        variant: "destructive"
      });
    }
  };

  const filteredInventory = inventoryReport.filter(item =>
    item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.product_sku?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeReservations = reservations.filter(r => r.status === 'active');
  const expiringIn24h = activeReservations.filter(r => {
    const hoursLeft = (new Date(r.expires_at).getTime() - Date.now()) / (1000 * 60 * 60);
    return hoursLeft <= 24 && hoursLeft > 0;
  });

  return (
    <>
      <Helmet>
        <title>Gestão de Estoque e Reservas - Admin</title>
      </Helmet>

      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gestão de Estoque e Reservas</h1>
          <p className="text-muted-foreground">
            Monitore o estoque disponível, reservado e as reservas ativas
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalReservedVolume.toLocaleString('pt-BR') || 0} L reservados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expirando em 24h</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {stats?.expiringIn24hCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">Ação urgente necessária</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats?.conversionRate || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.confirmedCount || 0} confirmadas / {stats?.expiredCount || 0} expiradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryReport.length}</div>
              <p className="text-xs text-muted-foreground">SKUs únicos</p>
            </CardContent>
          </Card>
        </div>

        {/* Reservas Expirando */}
        {expiringIn24h.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Reservas Expirando nas Próximas 24 Horas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {expiringIn24h.map(reservation => (
                  <div
                    key={reservation.id}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{reservation.product_sku}</p>
                      <p className="text-sm text-muted-foreground">
                        {reservation.opportunity?.client?.company_name} • {reservation.reserved_volume}L
                      </p>
                      <p className="text-xs text-orange-600">
                        Expira {formatDistanceToNow(new Date(reservation.expires_at), { 
                          locale: ptBR, 
                          addSuffix: true 
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCancelReservation(reservation.proposal_id)}
                    >
                      Cancelar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabela de Estoque */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Estoque por Produto e Localização</CardTitle>
              <div className="w-72">
                <Input
                  placeholder="Buscar produto ou SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Disponibilidade</TableHead>
                  <TableHead>Reservas Ativas</TableHead>
                  <TableHead>Próxima Expiração</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item: any) => (
                  <TableRow key={`${item.product_sku}-${item.city}-${item.state}`}>
                    <TableCell className="font-medium">{item.product_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.product_sku}
                    </TableCell>
                    <TableCell>{item.city}, {item.state}</TableCell>
                    <TableCell>
                      <StockAvailabilityBadge
                        totalVolume={item.total_volume || 0}
                        availableVolume={item.available_volume || 0}
                        reservedVolume={item.reserved_volume || 0}
                        unit="L"
                      />
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {item.active_reservations || 0} reserva(s)
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.next_expiry ? (
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(item.next_expiry), { 
                            locale: ptBR, 
                            addSuffix: true 
                          })}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Todas as Reservas */}
        <Card>
          <CardHeader>
            <CardTitle>Todas as Reservas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposta</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Volume</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.proposal?.proposal_number}
                    </TableCell>
                    <TableCell>
                      {reservation.opportunity?.client?.company_name}
                    </TableCell>
                    <TableCell className="text-xs">{reservation.product_sku}</TableCell>
                    <TableCell>{reservation.reserved_volume}L</TableCell>
                    <TableCell className="text-xs">
                      {reservation.city}, {reservation.state}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          reservation.status === 'active' ? 'default' :
                          reservation.status === 'consumed' ? 'outline' :
                          'secondary'
                        }
                      >
                        {reservation.status === 'active' && 'Ativa'}
                        {reservation.status === 'consumed' && 'Confirmada'}
                        {reservation.status === 'expired' && 'Expirada'}
                        {reservation.status === 'cancelled' && 'Cancelada'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">
                      {reservation.status === 'active' && (
                        formatDistanceToNow(new Date(reservation.expires_at), { 
                          locale: ptBR, 
                          addSuffix: true 
                        })
                      )}
                      {reservation.status === 'consumed' && 'Confirmada'}
                      {reservation.status === 'expired' && 'Expirada'}
                      {reservation.status === 'cancelled' && 'Cancelada'}
                    </TableCell>
                    <TableCell>
                      {reservation.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelReservation(reservation.proposal_id)}
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancelar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
