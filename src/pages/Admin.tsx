
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { toast } from 'sonner';
import { PendingUser, AdminStats } from '@/types/admin';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Check, X, Eye, Users, UserCheck, UserX, Clock, LogOut, RefreshCw } from 'lucide-react';
import { userService } from '@/services/userService';

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalUsers: 0
  });
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
    
    const newStats = {
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      totalUsers: pendingUsers.length
    };
    
    console.log('Estatísticas atualizadas:', newStats);
    setStats(newStats);
  }, [pendingUsers]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
            <p className="text-gray-600">Gerencie os acessos à plataforma Agro Ikemba</p>
          </div>
          <div className="flex gap-2">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Acesso ({pendingUsers.length} total)</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin text-gray-400" />
                <p className="text-gray-500">Carregando usuários...</p>
              </div>
            ) : pendingUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma solicitação de cadastro encontrada.</p>
                <p className="text-sm">Aguarde por novos usuários ou clique em "Atualizar".</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
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
      </div>
    </div>
  );
}
