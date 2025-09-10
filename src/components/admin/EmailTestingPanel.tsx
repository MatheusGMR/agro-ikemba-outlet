import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Send } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function EmailTestingPanel() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testEmail, setTestEmail] = useState('');
  const [customSubject, setCustomSubject] = useState('');
  const [customContent, setCustomContent] = useState('');

  const sendTestEmail = async () => {
    if (!testEmail) {
      toast.error('Digite um email para teste');
      return;
    }

    setLoading(true);
    setTestResult(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-auth-email', {
        body: {
          email: testEmail,
          type: 'test',
          name: 'Admin',
          subject: customSubject,
          content: customContent
        }
      });

      if (error) throw error;

      setTestResult(data);
      
      if (data.success) {
        toast.success('Email enviado com sucesso!');
      } else {
        toast.error(`Falha no envio: ${data.error}`);
      }
    } catch (error: any) {
      console.error('Erro no teste:', error);
      setTestResult({ success: false, error: error.message });
      toast.error(`Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sendToMatheus = () => {
    setTestEmail('matheus.roldan@metasix.com.br');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Teste de Email em Produção
        </CardTitle>
        <CardDescription>
          Envie emails de teste usando a configuração de produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="test-email">Email para teste</Label>
          <div className="flex gap-2">
            <Input
              id="test-email"
              type="email"
              placeholder="Digite o email de destino"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={sendToMatheus}
              disabled={loading}
            >
              Usar Matheus
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-subject">Assunto personalizado (opcional)</Label>
          <Input
            id="custom-subject"
            placeholder="Deixe vazio para usar padrão"
            value={customSubject}
            onChange={(e) => setCustomSubject(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="custom-content">Conteúdo HTML personalizado (opcional)</Label>
          <Textarea
            id="custom-content"
            placeholder="Deixe vazio para usar template padrão"
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
          <Send className="h-4 w-4 mr-2" />
          {loading ? 'Enviando...' : 'Enviar Email de Teste'}
        </Button>

        {testResult && (
          <Alert className={testResult.success ? "border-green-500" : "border-red-500"}>
            <AlertDescription>
              {testResult.success ? (
                <div className="text-green-700">
                  ✅ Email enviado com sucesso!
                  {testResult.data?.id && <div className="text-xs mt-1">ID: {testResult.data.id}</div>}
                </div>
              ) : (
                <div className="text-red-700">
                  ❌ Erro: {testResult.error}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertDescription>
            <strong>Dica:</strong> Verifique tanto a caixa de entrada quanto o spam. Para produção, 
            configure seu domínio em <a href="https://resend.com/domains" target="_blank" className="underline">resend.com/domains</a> 
            e atualize o RESEND_FROM para usar um email do seu domínio (ex: noreply@agroikemba.com.br).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}