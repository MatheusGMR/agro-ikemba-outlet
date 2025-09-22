
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { PendingUser, AdminStats } from '@/types/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Check, X, Eye, Users, UserCheck, UserX, Clock, LogOut, RefreshCw, Search, Phone, PhoneOff, Mail } from 'lucide-react';
import { userService } from '@/services/userService';
import { ImageUploader } from '@/components/admin/ImageUploader';
import EmailTestingPanel from '@/components/admin/EmailTestingPanel';
import { AuthUsersBatchPanel } from '@/components/admin/AuthUsersBatchPanel';
import { supabase } from '@/integrations/supabase/client';

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [contactFilter, setContactFilter] = useState<string>('all');
  const [stats, setStats] = useState<AdminStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalUsers: 0,
    missingPhone: 0,
    missingEmail: 0
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const loadUsers = async () => {
    console.log('Carregando usuários do Supabase...');
    setIsLoading(true);
    
    try {
      const { success, users, error } = await userService.getUsers();
      
      if (success && users) {
        console.log('Usuários carregados do Supabase:', users.length);
        setPendingUsers(users);
      } else {
        console.error('Erro ao carregar usuários:', error);
        toast.error('Erro ao carregar usuários: ' + error);
      }
    } catch (error) {
      console.error('Erro inesperado ao carregar usuários:', error);
      toast.error('Erro inesperado ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Admin panel inicializado - carregando usuários do Supabase...');
    loadUsers();
    
    // Recarregar dados a cada 30 segundos para capturar novos cadastros
    const interval = setInterval(loadUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const pending = pendingUsers.filter(u => u.status === 'pending').length;
    const approved = pendingUsers.filter(u => u.status === 'approved').length;
    const rejected = pendingUsers.filter(u => u.status === 'rejected').length;
    const missingPhone = pendingUsers.filter(u => !u.phone || u.phone.trim() === '').length;
    const missingEmail = pendingUsers.filter(u => !u.email || u.email.trim() === '').length;
    
    const newStats = {
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      totalUsers: pendingUsers.length,
      missingPhone,
      missingEmail
    };
    
    console.log('Estatísticas atualizadas:', newStats);
    setStats(newStats);
  }, [pendingUsers]);

  // Filter users based on search and filters
  useEffect(() => {
    let filtered = pendingUsers;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Contact filter
    if (contactFilter !== 'all') {
      if (contactFilter === 'missing-phone') {
        filtered = filtered.filter(user => !user.phone || user.phone.trim() === '');
      } else if (contactFilter === 'missing-email') {
        filtered = filtered.filter(user => !user.email || user.email.trim() === '');
      } else if (contactFilter === 'complete') {
        filtered = filtered.filter(user => user.phone && user.phone.trim() !== '' && user.email && user.email.trim() !== '');
      }
    }

    setFilteredUsers(filtered);
  }, [pendingUsers, searchTerm, statusFilter, contactFilter]);

  const handleApprove = async (userId: string) => {
    console.log('Aprovando usuário:', userId);
    
    try {
      const { success, error } = await userService.updateUserStatus(userId, 'approved');
      
      if (success) {
        await loadUsers(); // Recarregar dados do Supabase
        toast.success('Usuário aprovado com sucesso!', {
          description: 'O acesso foi liberado para o usuário.',
        });
      } else {
        toast.error('Erro ao aprovar usuário: ' + error);
      }
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error);
      toast.error('Erro inesperado ao aprovar usuário');
    }
  };

  const handleReject = async (userId: string) => {
    console.log('Rejeitando usuário:', userId);
    
    try {
      const { success, error } = await userService.updateUserStatus(userId, 'rejected');
      
      if (success) {
        await loadUsers(); // Recarregar dados do Supabase
        toast.error('Usuário rejeitado', {
          description: 'O acesso foi negado para o usuário.',
        });
      } else {
        toast.error('Erro ao rejeitar usuário: ' + error);
      }
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error);
      toast.error('Erro inesperado ao rejeitar usuário');
    }
  };

  const openUserDialog = (user: PendingUser) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>;
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-600"><UserCheck className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-600"><UserX className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRefresh = () => {
    console.log('Atualizando lista de usuários do Supabase...');
    loadUsers();
    toast.success('Lista atualizada!');
  };

  const handleRequestContact = async (user: PendingUser, missingField: 'phone' | 'email') => {
    console.log('Solicitando contato para usuário:', user.id, 'campo:', missingField);
    
    try {
      const { data, error } = await supabase.functions.invoke('request-missing-contact', {
        body: {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          missingField
        }
      });

      if (error) {
        console.error('Erro ao solicitar contato:', error);
        toast.error('Erro ao enviar solicitação de contato');
        return;
      }

      toast.success(`Solicitação de ${missingField === 'phone' ? 'telefone' : 'email'} enviada para ${user.name}!`);
    } catch (error) {
      console.error('Erro inesperado ao solicitar contato:', error);
      toast.error('Erro inesperado ao enviar solicitação');
    }
  };

  const createAuthUsers = async (userIds?: string[]) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('create-auth-users-batch', {
        body: { 
          userIds: userIds || selectedUsers,
          createAll: !userIds && selectedUsers.length === 0
        }
      });

      if (error) throw error;

      const summary = data.summary;
      const messages = [];
      if (summary.created > 0) messages.push(`${summary.created} criadas`);
      if (summary.already_exists > 0) messages.push(`${summary.already_exists} já existiam`);
      if (summary.recovery_sent > 0) messages.push(`${summary.recovery_sent} receberam link de recuperação`);

      toast.success("Contas processadas", {
        description: messages.join(', '),
      });

      // Refresh users list
      loadUsers();
      setSelectedUsers([]);
    } catch (error: any) {
      console.error('Error creating auth users:', error);
      toast.error("Erro", {
        description: error.message || "Erro ao criar contas de autenticação",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: 'admin@agroikemba.com.br',
          type: 'test',
          name: 'Administrador'
        }
      });

      if (error) throw error;

      toast.success("Email de teste enviado", {
        description: "Verifique sua caixa de entrada e spam.",
      });
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast.error("Erro ao enviar email", {
        description: error.message || "Erro ao enviar email de teste",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserSelection = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedUsers(prev => [...prev, userId]);
    } else {
      setSelectedUsers(prev => prev.filter(id => id !== userId));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie os acessos à plataforma Agro Ikemba</p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => createAuthUsers()}
              disabled={loading}
              variant="default"
            >
              Criar Contas Auth (Todos)
            </Button>
            <Button 
              onClick={sendTestEmail}
              disabled={loading}
              variant="outline"
            >
              <Mail className="w-4 h-4 mr-2" />
              Enviar Email de Teste
            </Button>
            <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Administration Tabs */}
        <Tabs defaultValue="users" className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="auth">Auth Creation</TabsTrigger>
            <TabsTrigger value="images">Image Upload</TabsTrigger>
            <TabsTrigger value="email">Email Testing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aprovados</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalApproved}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejeitados</CardTitle>
              <UserX className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.totalRejected}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Telefone</CardTitle>
              <PhoneOff className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.missingPhone}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sem Email</CardTitle>
              <Mail className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{stats.missingEmail}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar por nome, email ou empresa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="approved">Aprovados</SelectItem>
                  <SelectItem value="rejected">Rejeitados</SelectItem>
                </SelectContent>
              </Select>

              <Select value={contactFilter} onValueChange={setContactFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="missing-phone">Sem Telefone</SelectItem>
                  <SelectItem value="missing-email">Sem Email</SelectItem>
                  <SelectItem value="complete">Contato Completo</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setContactFilter('all');
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Solicitações de Acesso 
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({filteredUsers.length} de {pendingUsers.length} usuários)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700 mb-2">
                  {selectedUsers.length} usuário(s) selecionado(s)
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => createAuthUsers(selectedUsers)}
                    disabled={loading}
                    size="sm"
                  >
                    Criar Contas Auth para Selecionados
                  </Button>
                  <Button
                    onClick={() => setSelectedUsers([])}
                    variant="outline"
                    size="sm"
                  >
                    Limpar Seleção
                  </Button>
                </div>
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum usuário encontrado com os filtros aplicados.</p>
                <p className="text-sm">Tente ajustar os filtros ou clique em "Atualizar".</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(filteredUsers.map(u => u.id));
                          } else {
                            setSelectedUsers([]);
                          }
                        }}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => handleUserSelection(user.id, e.target.checked)}
                          className="rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {user.phone ? (
                            <>
                              <Phone className="h-4 w-4 text-green-600" />
                              <span className="text-sm">{user.phone}</span>
                            </>
                          ) : (
                            <>
                              <PhoneOff className="h-4 w-4 text-orange-600" />
                              <span className="text-sm text-orange-600">Não informado</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="ml-2 text-xs h-6 px-2"
                                onClick={() => handleRequestContact(user, 'phone')}
                              >
                                Solicitar
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{user.tipo}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUserDialog(user)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {user.status === 'pending' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-green-600 border-green-600 hover:bg-green-50"
                                onClick={() => handleApprove(user.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-red-600 border-red-600 hover:bg-red-50"
                                onClick={() => handleReject(user.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* User Detail Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Detalhes do Usuário</DialogTitle>
              <DialogDescription>
                Informações completas da solicitação de acesso
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nome</label>
                  <p className="text-lg">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Telefone</label>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedUser.phone ? (
                      <>
                        <Phone className="h-4 w-4 text-green-600" />
                        <p className="text-lg">{selectedUser.phone}</p>
                      </>
                    ) : (
                      <>
                        <PhoneOff className="h-4 w-4 text-orange-600" />
                        <p className="text-lg text-orange-600">Não informado</p>
                        <Badge variant="outline" className="text-orange-600 border-orange-600 ml-2">
                          Contato necessário
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tipo de Usuário</label>
                  <p className="text-lg">{selectedUser.tipo}</p>
                </div>
                {selectedUser.conheceu && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Como nos conheceu</label>
                    <p className="text-lg">{selectedUser.conheceu}</p>
                  </div>
                )}
                {selectedUser.cnpj && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">CNPJ</label>
                    <p className="text-lg">{selectedUser.cnpj}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Data da Solicitação</label>
                  <p className="text-lg">{new Date(selectedUser.createdAt).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedUser.status)}</div>
                </div>
              </div>
            )}
            <DialogFooter>
              {selectedUser?.status === 'pending' && (
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50"
                    onClick={() => {
                      handleReject(selectedUser.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Rejeitar
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      handleApprove(selectedUser.id);
                      setIsDialogOpen(false);
                    }}
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Aprovar
                  </Button>
                </div>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        </TabsContent>
          
          <TabsContent value="auth" className="mt-6">
            <AuthUsersBatchPanel />
          </TabsContent>
          
          <TabsContent value="images" className="mt-6">
            <ImageUploader />
          </TabsContent>
          
          <TabsContent value="email" className="mt-6">
            <EmailTestingPanel />
          </TabsContent>
        
        </Tabs>
        </div>
      </div>
    </div>
  );
}
