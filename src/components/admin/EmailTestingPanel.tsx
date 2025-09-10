import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EmailTestingPanel() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [authEmailLoading, setAuthEmailLoading] = useState(false);
  const [authTestResult, setAuthTestResult] = useState<any>(null);
  const [userName, setUserName] = useState('');

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Por favor, insira um email para teste');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: testEmail,
          type: 'test',
          subject: customSubject || 'Email de Teste - AgroConnect',
          content: customContent || undefined
        }
      });

      if (error) throw error;

      setTestResult(data);
      toast.success('Email de teste enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar email de teste:', error);
      toast.error('Erro ao enviar email de teste: ' + error.message);
      setTestResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const sendAuthCreatedEmail = async () => {
    if (!testEmail) {
      toast.error('Por favor, insira um email para teste');
      return;
    }

    setAuthEmailLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: testEmail,
          type: 'auth_created',
          name: userName || 'Usuário Teste',
          password: 'SenhaTemporaria123'
        }
      });

      if (error) throw error;

      setAuthTestResult(data);
      toast.success('Email de boas-vindas enviado com sucesso!');
    } catch (error: any) {
      console.error('Erro ao enviar email de boas-vindas:', error);
      toast.error('Erro ao enviar email de boas-vindas: ' + error.message);
      setAuthTestResult({ error: error.message });
    } finally {
      setAuthEmailLoading(false);
    }
  };

  const sendToMatheus = () => {
    setTestEmail('matheusmotaroldan@hotmail.com');
    setUserName('Matheus');
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="custom" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="custom">Email Personalizado</TabsTrigger>
          <TabsTrigger value="auth">Template de Boas-vindas</TabsTrigger>
        </TabsList>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Teste de Email Personalizado</CardTitle>
              <CardDescription>
                Envie emails de teste com conteúdo personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="testEmail">Email de Destino</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="testEmail"
                    type="email"
                    placeholder="Digite o email para teste"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendToMatheus}
                    variant="outline"
                    size="sm"
                  >
                    Use Matheus
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="customSubject">Assunto Personalizado (opcional)</Label>
                <Input
                  id="customSubject"
                  placeholder="Deixe vazio para usar o padrão"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="customContent">Conteúdo HTML Personalizado (opcional)</Label>
                <Textarea
                  id="customContent"
                  placeholder="Deixe vazio para usar o template padrão"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  rows={4}
                />
              </div>

              <Button 
                onClick={sendTestEmail} 
                disabled={loading || !testEmail}
                className="w-full"
              >
                {loading ? 'Enviando...' : 'Enviar Email de Teste'}
              </Button>

              {testResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Resultado do Teste:</h4>
                  <pre className="text-sm whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Template de Email de Boas-vindas</CardTitle>
              <CardDescription>
                Teste o template completo de email enviado quando uma conta é criada (inclui vídeo embeded)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="authTestEmail">Email de Destino</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="authTestEmail"
                    type="email"
                    placeholder="Digite o email para teste"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={sendToMatheus}
                    variant="outline"
                    size="sm"
                  >
                    Use Matheus
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="userName">Nome do Usuário</Label>
                <Input
                  id="userName"
                  placeholder="Nome que aparecerá no email"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                />
              </div>

              <Button 
                onClick={sendAuthCreatedEmail} 
                disabled={authEmailLoading || !testEmail}
                className="w-full"
              >
                {authEmailLoading ? 'Enviando...' : 'Enviar Email de Boas-vindas'}
              </Button>

              {authTestResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Resultado do Teste:</h4>
                  <pre className="text-sm whitespace-pre-wrap overflow-auto">
                    {JSON.stringify(authTestResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <AlertDescription>
          <strong>Dica:</strong> O template de boas-vindas inclui um vídeo embeded demonstrando a experiência mobile. 
          Certifique-se de que seu domínio está verificado no Resend para evitar que os emails sejam marcados como spam.
        </AlertDescription>
      </Alert>
    </div>
  );
}