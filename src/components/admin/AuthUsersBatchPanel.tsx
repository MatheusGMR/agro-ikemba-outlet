import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface BatchResult {
  user_id: string;
  email: string;
  auth_id?: string;
  status: 'created' | 'already_exists' | 'recovery_sent' | 'error' | 'created_no_email';
  message: string;
  temp_password?: string;
  error?: string;
}

interface BatchSummary {
  total: number;
  created: number;
  already_exists: number;
  recovery_sent: number;
  errors: number;
  created_no_email: number;
}

export function AuthUsersBatchPanel() {
  const [loading, setLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<{
    summary: BatchSummary;
    results: BatchResult[];
  } | null>(null);

  const createAuthUsersInBatch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-auth-users-batch', {
        body: {
          createAll: true
        }
      });

      if (error) throw error;

      setBatchResult(data);
      toast.success(`Processamento concluído! ${data.summary.created} contas criadas, ${data.summary.recovery_sent} recuperações enviadas`);
    } catch (error: any) {
      console.error('Erro ao criar usuários em lote:', error);
      toast.error('Erro ao criar usuários em lote: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'created':
        return <Badge className="bg-green-100 text-green-800">Criado</Badge>;
      case 'already_exists':
        return <Badge className="bg-blue-100 text-blue-800">Já Existe</Badge>;
      case 'recovery_sent':
        return <Badge className="bg-yellow-100 text-yellow-800">Recuperação Enviada</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
      case 'created_no_email':
        return <Badge className="bg-orange-100 text-orange-800">Criado sem Email</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Criação de Usuários Auth em Lote</CardTitle>
          <CardDescription>
            Cria contas de autenticação para todos os usuários aprovados que ainda não possuem conta auth
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              <strong>Atenção:</strong> Esta função irá:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Buscar todos os usuários com status "aprovado"</li>
                <li>Criar contas de autenticação para usuários que não possuem</li>
                <li>Gerar senhas temporárias e enviar por email</li>
                <li>Para usuários que já possuem conta, enviar link de recuperação</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            onClick={createAuthUsersInBatch} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processando...' : 'Criar Contas Auth para Usuários Aprovados'}
          </Button>

          {batchResult && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Processamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{batchResult.summary.total}</div>
                      <div className="text-sm text-gray-600">Total</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{batchResult.summary.created}</div>
                      <div className="text-sm text-gray-600">Criados</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{batchResult.summary.recovery_sent}</div>
                      <div className="text-sm text-gray-600">Recuperações</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{batchResult.summary.already_exists}</div>
                      <div className="text-sm text-gray-600">Já Existiam</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{batchResult.summary.errors}</div>
                      <div className="text-sm text-gray-600">Erros</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">{batchResult.summary.created_no_email}</div>
                      <div className="text-sm text-gray-600">Sem Email</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes por Usuário</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {batchResult.results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{result.email}</div>
                          <div className="text-sm text-gray-600">{result.message}</div>
                          {result.temp_password && (
                            <div className="text-xs text-gray-500 font-mono mt-1">
                              Senha temporária: {result.temp_password}
                            </div>
                          )}
                          {result.error && (
                            <div className="text-xs text-red-600 mt-1">
                              Erro: {result.error}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}