import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Filter, 
  Eye,
  MapPin,
  Building,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface RepresentativeApplication {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  cidade: string;
  uf: string;
  status: string;
  motivo_status: string | null;
  experiencia_anos: string;
  possui_pj: boolean;
  cnpj: string | null;
  razao_social: string | null;
  segmentos: string[];
  regioes: string[];
  canais: string[];
  conflito_interesse: boolean;
  conflito_detalhe: string | null;
  linkedin: string | null;
  termos_aceitos: boolean;
  created_at: string;
  infra_veic_proprio: boolean;
  infra_celular: boolean;
  infra_internet: boolean;
}

export default function RepresentativeApplicationsAnalysis() {
  const [selectedApplication, setSelectedApplication] = useState<RepresentativeApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionDialog, setActionDialog] = useState<{open: boolean, type: 'approve' | 'reject' | null, application: RepresentativeApplication | null}>({
    open: false,
    type: null,
    application: null
  });
  const [actionReason, setActionReason] = useState('');

  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['representative-applications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representative_applications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RepresentativeApplication[];
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, motivo }: { id: string, status: string, motivo: string }) => {
      const { error } = await supabase
        .from('representative_applications')
        .update({ status, motivo_status: motivo })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representative-applications'] });
      setActionDialog({ open: false, type: null, application: null });
      setActionReason('');
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    }
  });

  const filteredApplications = applications.filter(app => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const matchesSearch = app.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.cidade.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    aguardando: applications.filter(app => app.status === 'aguardando').length,
    aprovado: applications.filter(app => app.status === 'aprovado').length,
    reprovado: applications.filter(app => app.status === 'reprovado').length,
    comPJ: applications.filter(app => app.possui_pj).length,
    comExperiencia: applications.filter(app => app.experiencia_anos === '>5 anos').length
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      aguardando: 'secondary',
      aprovado: 'default',
      reprovado: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const handleAction = (type: 'approve' | 'reject', application: RepresentativeApplication) => {
    setActionDialog({ open: true, type, application });
  };

  const confirmAction = () => {
    if (!actionDialog.application || !actionDialog.type) return;
    
    const status = actionDialog.type === 'approve' ? 'aprovado' : 'reprovado';
    updateStatusMutation.mutate({
      id: actionDialog.application.id,
      status,
      motivo: actionReason
    });
  };

  if (isLoading) {
    return <div className="p-6">Carregando aplicações...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
            <div className="text-2xl font-bold">{stats.aguardando}</div>
            <div className="text-sm text-muted-foreground">Aguardando</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <div className="text-2xl font-bold">{stats.aprovado}</div>
            <div className="text-sm text-muted-foreground">Aprovados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-red-500" />
            <div className="text-2xl font-bold">{stats.reprovado}</div>
            <div className="text-sm text-muted-foreground">Reprovados</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Building className="h-8 w-8 mx-auto mb-2 text-blue-500" />
            <div className="text-2xl font-bold">{stats.comPJ}</div>
            <div className="text-sm text-muted-foreground">Com PJ</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <div className="text-2xl font-bold">{stats.comExperiencia}</div>
            <div className="text-sm text-muted-foreground">+5 Anos Exp.</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Buscar por nome, email ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="aguardando">Aguardando</SelectItem>
                <SelectItem value="aprovado">Aprovado</SelectItem>
                <SelectItem value="reprovado">Reprovado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Aplicações */}
      <div className="grid gap-4">
        {filteredApplications.map((application) => (
          <Card key={application.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{application.nome}</h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                    <span className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {application.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {application.whatsapp}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.cidade}, {application.uf}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(application.status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedApplication(application)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver Detalhes
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <strong>Experiência:</strong> {application.experiencia_anos}
                </div>
                <div>
                  <strong>PJ:</strong> {application.possui_pj ? 'Sim' : 'Não'}
                </div>
                <div>
                  <strong>Segmentos:</strong> {application.segmentos.length}
                </div>
                <div>
                  <strong>Data:</strong> {new Date(application.created_at).toLocaleDateString()}
                </div>
              </div>

              {application.status === 'aguardando' && (
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleAction('approve', application)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Aprovar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction('reject', application)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Detalhes */}
      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Aplicação - {selectedApplication?.nome}</DialogTitle>
          </DialogHeader>
          
          {selectedApplication && (
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="business">Negócio</TabsTrigger>
                <TabsTrigger value="experience">Experiência</TabsTrigger>
                <TabsTrigger value="infrastructure">Infraestrutura</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Nome:</strong> {selectedApplication.nome}
                  </div>
                  <div>
                    <strong>Email:</strong> {selectedApplication.email}
                  </div>
                  <div>
                    <strong>WhatsApp:</strong> {selectedApplication.whatsapp}
                  </div>
                  <div>
                    <strong>Cidade/UF:</strong> {selectedApplication.cidade}, {selectedApplication.uf}
                  </div>
                  <div>
                    <strong>LinkedIn:</strong> 
                    {selectedApplication.linkedin ? (
                      <a href={selectedApplication.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        Ver perfil
                      </a>
                    ) : 'Não informado'}
                  </div>
                  <div>
                    <strong>Data da Aplicação:</strong> {new Date(selectedApplication.created_at).toLocaleString()}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Possui PJ:</strong> {selectedApplication.possui_pj ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>CNPJ:</strong> {selectedApplication.cnpj || 'Não informado'}
                  </div>
                  <div className="col-span-2">
                    <strong>Razão Social:</strong> {selectedApplication.razao_social || 'Não informada'}
                  </div>
                  <div className="col-span-2">
                    <strong>Segmentos:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.segmentos.map((seg, idx) => (
                        <Badge key={idx} variant="secondary">{seg}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <strong>Canais:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedApplication.canais.map((canal, idx) => (
                        <Badge key={idx} variant="outline">{canal}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="experience" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <strong>Experiência:</strong> {selectedApplication.experiencia_anos}
                  </div>
                  <div>
                    <strong>Regiões de Atuação:</strong>
                    <div className="mt-2">
                      {selectedApplication.regioes.map((regiao, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded mb-1">{regiao}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <strong>Conflito de Interesse:</strong> {selectedApplication.conflito_interesse ? 'Sim' : 'Não'}
                  </div>
                  {selectedApplication.conflito_detalhe && (
                    <div>
                      <strong>Detalhe do Conflito:</strong>
                      <div className="p-2 bg-yellow-50 rounded mt-1">{selectedApplication.conflito_detalhe}</div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="infrastructure" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Veículo Próprio:</strong> {selectedApplication.infra_veic_proprio ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Celular:</strong> {selectedApplication.infra_celular ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Internet:</strong> {selectedApplication.infra_internet ? 'Sim' : 'Não'}
                  </div>
                  <div>
                    <strong>Termos Aceitos:</strong> {selectedApplication.termos_aceitos ? 'Sim' : 'Não'}
                  </div>
                </div>
                
                {selectedApplication.motivo_status && (
                  <div>
                    <strong>Motivo do Status:</strong>
                    <div className="p-2 bg-gray-50 rounded mt-1">{selectedApplication.motivo_status}</div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Ação */}
      <Dialog open={actionDialog.open} onOpenChange={() => setActionDialog({ open: false, type: null, application: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'approve' ? 'Aprovar' : 'Rejeitar'} Aplicação
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Você está prestes a <strong>{actionDialog.type === 'approve' ? 'aprovar' : 'rejeitar'}</strong> a aplicação de:
            </p>
            <div className="p-4 bg-gray-50 rounded">
              <strong>{actionDialog.application?.nome}</strong><br />
              {actionDialog.application?.email}<br />
              {actionDialog.application?.cidade}, {actionDialog.application?.uf}
            </div>
            
            <div>
              <label className="text-sm font-medium">
                {actionDialog.type === 'approve' ? 'Observações (opcional)' : 'Motivo da rejeição'}
              </label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder={actionDialog.type === 'approve' 
                  ? 'Adicione observações sobre a aprovação...' 
                  : 'Explique o motivo da rejeição...'
                }
                className="mt-1"
                required={actionDialog.type === 'reject'}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setActionDialog({ open: false, type: null, application: null })}
              >
                Cancelar
              </Button>
              <Button 
                variant={actionDialog.type === 'approve' ? 'default' : 'destructive'}
                onClick={confirmAction}
                disabled={actionDialog.type === 'reject' && !actionReason.trim()}
              >
                {actionDialog.type === 'approve' ? 'Aprovar' : 'Rejeitar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}