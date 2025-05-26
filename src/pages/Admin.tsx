
import { useState, useEffect } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { PendingUser, AdminStats } from '@/types/admin';
import { Check, X, Eye, Users, UserCheck, UserX, Clock } from 'lucide-react';

export default function Admin() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    totalUsers: 0
  });
  const { toast } = useToast();

  // Simular dados - em produção viriam do backend
  useEffect(() => {
    const mockUsers: PendingUser[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        tipo: 'Distribuidor',
        conheceu: 'Google',
        createdAt: '2024-01-15',
        status: 'pending'
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria@email.com',
        tipo: 'Fabricante',
        conheceu: 'Indicação',
        createdAt: '2024-01-14',
        status: 'pending'
      },
      {
        id: '3',
        name: 'Pedro Costa',
        email: 'pedro@email.com',
        tipo: 'Cooperativa',
        createdAt: '2024-01-13',
        status: 'approved'
      }
    ];

    const stored = localStorage.getItem('pendingUsers');
    if (stored) {
      setPendingUsers(JSON.parse(stored));
    } else {
      setPendingUsers(mockUsers);
      localStorage.setItem('pendingUsers', JSON.stringify(mockUsers));
    }
  }, []);

  useEffect(() => {
    const pending = pendingUsers.filter(u => u.status === 'pending').length;
    const approved = pendingUsers.filter(u => u.status === 'approved').length;
    const rejected = pendingUsers.filter(u => u.status === 'rejected').length;
    
    setStats({
      totalPending: pending,
      totalApproved: approved,
      totalRejected: rejected,
      totalUsers: pendingUsers.length
    });
  }, [pendingUsers]);

  const handleApprove = (userId: string) => {
    const updatedUsers = pendingUsers.map(user => 
      user.id === userId ? { ...user, status: 'approved' as const } : user
    );
    setPendingUsers(updatedUsers);
    localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário aprovado",
      description: "O acesso foi liberado com sucesso.",
    });
  };

  const handleReject = (userId: string) => {
    const updatedUsers = pendingUsers.map(user => 
      user.id === userId ? { ...user, status: 'rejected' as const } : user
    );
    setPendingUsers(updatedUsers);
    localStorage.setItem('pendingUsers', JSON.stringify(updatedUsers));
    
    toast({
      title: "Usuário rejeitado",
      description: "O acesso foi negado.",
      variant: "destructive"
    });
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Painel Administrativo</h1>
          <p className="text-gray-600">Gerencie os acessos à plataforma Agro Ikemba</p>
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
            <CardTitle>Solicitações de Acesso</CardTitle>
          </CardHeader>
          <CardContent>
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
