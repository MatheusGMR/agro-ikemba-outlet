
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const clearStorageAndStart = () => {
    // Limpar qualquer dados conflitantes
    localStorage.removeItem('adminSession');
    localStorage.removeItem('user');
    console.log('Storage limpo antes do login');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    console.log('Tentativa de login:', { email, password: password ? '***' : 'vazio' });

    // Limpar storage antes de tentar
    clearStorageAndStart();

    try {
      // Verificar credenciais específicas do admin
      if (email === 'admin@agroikemba.com' && password === 'AgroIkemba2024!') {
        console.log('Credenciais válidas, criando sessão...');
        
        // Armazenar token de admin com timestamp
        const adminSession = {
          email: email,
          isAdmin: true,
          loginTime: Date.now(),
          verified: true
        };
        
        const userSession = {
          email: email,
          name: 'Administrador',
          verified: true,
          isAdmin: true
        };
        
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        localStorage.setItem('user', JSON.stringify(userSession));
        
        console.log('Sessão criada:', adminSession);
        
        toast.success('Login realizado com sucesso!');
        
        // Dar um tempo para o storage ser persistido e força recarga
        setTimeout(() => {
          console.log('Redirecionando para /admin');
          window.location.href = '/admin'; // Força uma recarga completa
        }, 200);
      } else {
        console.log('Credenciais inválidas');
        setError('Credenciais inválidas. Verifique email e senha.');
        toast.error('Credenciais inválidas. Acesso negado.');
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro interno. Tente novamente.');
      toast.error('Erro interno. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Acesso Administrativo</CardTitle>
          <p className="text-gray-600">Entre com suas credenciais de admin</p>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  placeholder="admin@agroikemba.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  placeholder="Digite sua senha"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
