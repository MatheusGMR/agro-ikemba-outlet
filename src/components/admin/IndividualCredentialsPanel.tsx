import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Search, Send, UserCheck, UserX } from 'lucide-react';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  status: string;
  type: 'user' | 'representative';
}

export function IndividualCredentialsPanel() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const searchUser = async () => {
    if (!email.trim()) {
      toast.error('Digite um e-mail para buscar');
      return;
    }

    setSearching(true);
    try {
      // Buscar primeiro na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, name, status')
        .eq('email', email.trim())
        .maybeSingle();

      if (userData) {
        setUserInfo({
          ...userData,
          type: 'user'
        });
        return;
      }

      // Se não encontrou, buscar na tabela representatives
      const { data: repData, error: repError } = await supabase
        .from('representatives')
        .select('id, email, name, status')
        .eq('email', email.trim())
        .maybeSingle();

      if (repData) {
        setUserInfo({
          ...repData,
          type: 'representative'
        });
        return;
      }

      setUserInfo(null);
      toast.error('Usuário não encontrado');

    } catch (error: any) {
      console.error('Erro ao buscar usuário:', error);
      toast.error('Erro ao buscar usuário: ' + error.message);
    } finally {
      setSearching(false);
    }
  };

  const sendCredentials = async () => {
    if (!userInfo) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-auth-users-batch', {
        body: {
          userIds: [userInfo.id]
        }
      });

      if (error) throw error;

      if (data?.results?.length > 0) {
        const result = data.results[0];
        
        if (result.status === 'created') {
          toast.success(`Conta criada! Senha temporária: ${result.temp_password}`);
        } else if (result.status === 'already_exists' || result.status === 'recovery_sent') {
          toast.success('Link de recuperação enviado por e-mail');
        } else if (result.status === 'error') {
          toast.error(`Erro: ${result.error || result.message}`);
        } else {
          toast.info(`Status: ${result.message}`);
        }
      } else {
        toast.error('Nenhum resultado retornado');
      }

    } catch (error: any) {
      console.error('Erro ao enviar credenciais:', error);
      toast.error('Erro ao enviar credenciais: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    if (!userInfo) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(userInfo.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      toast.success('Link de recuperação enviado por e-mail');

    } catch (error: any) {
      console.error('Erro ao enviar link de recuperação:', error);
      toast.error('Erro ao enviar link: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, type: string) => {
    if (type === 'user') {
      switch (status) {
        case 'approved':
          return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
        case 'rejected':
          return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    } else {
      switch (status) {
        case 'active':
          return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
        case 'pending':
          return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
        case 'inactive':
          return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
        default:
          return <Badge variant="secondary">{status}</Badge>;
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Credenciais Individuais</CardTitle>
          <CardDescription>
            Busque um usuário específico e gerencie suas credenciais de acesso
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="email">E-mail do Usuário</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o e-mail para buscar"
                onKeyPress={(e) => e.key === 'Enter' && searchUser()}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={searchUser}
                disabled={searching}
                variant="outline"
              >
                <Search className="h-4 w-4 mr-2" />
                {searching ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </div>

          {userInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {userInfo.type === 'user' ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
                  Usuário Encontrado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Nome</Label>
                    <p className="text-sm">{userInfo.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">E-mail</Label>
                    <p className="text-sm">{userInfo.email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Tipo</Label>
                    <p className="text-sm capitalize">
                      {userInfo.type === 'user' ? 'Cliente' : 'Representante'}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      {getStatusBadge(userInfo.status, userInfo.type)}
                    </div>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Ações Disponíveis:</strong>
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      <li><strong>Criar/Reenviar Credenciais:</strong> Cria conta auth se não existir ou reenvia credenciais</li>
                      <li><strong>Enviar Link de Reset:</strong> Envia link de recuperação de senha diretamente</li>
                    </ul>
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button
                    onClick={sendCredentials}
                    disabled={loading}
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : 'Criar/Reenviar Credenciais'}
                  </Button>
                  <Button
                    onClick={sendPasswordReset}
                    disabled={loading}
                    variant="outline"
                    className="flex-1"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {loading ? 'Enviando...' : 'Enviar Link de Reset'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {userInfo === null && email && !searching && (
            <Alert>
              <AlertDescription>
                Nenhum usuário encontrado com o e-mail "{email}". 
                Verifique se o e-mail está correto e se o usuário está cadastrado no sistema.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}