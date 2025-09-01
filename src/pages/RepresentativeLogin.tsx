import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';

export default function RepresentativeLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn, user, isRepresentative } = useAuth();

  // Redirect if already logged in as representative
  useEffect(() => {
    if (user && isRepresentative) {
      navigate('/representative');
    }
  }, [user, isRepresentative, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!email || !password) {
        setError('Preencha todos os campos.');
        toast.error('Preencha todos os campos.');
        setIsLoading(false);
        return;
      }

      const { error: authError } = await signIn(email, password);
      
      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos.');
          toast.error('Email ou senha incorretos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Confirme seu email antes de fazer login.');
          toast.error('Confirme seu email antes de fazer login.');
        } else {
          setError('Erro ao fazer login. Tente novamente.');
          toast.error('Erro ao fazer login. Tente novamente.');
        }
      } else {
        // Success - redirect to representative dashboard
        navigate('/representative');
        toast.success('Login realizado com sucesso!');
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro interno. Tente novamente.');
      toast.error('Erro interno. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login Representante - AgroIkemba</title>
        <meta name="description" content="Acesse seu painel de representante AgroIkemba e gerencie suas vendas, clientes e comissões." />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Users className="h-8 w-8 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Painel do Representante</CardTitle>
              <p className="text-muted-foreground">Entre com suas credenciais de representante</p>
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
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      placeholder="Digite seu email de representante"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
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
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Entrando...' : 'Acessar Painel'}
                </Button>
              </form>
              
              <div className="mt-6 text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Ainda não é representante?{' '}
                  <Link to="/representative/register" className="text-primary hover:underline font-medium">
                    Cadastre-se aqui
                  </Link>
                </p>
                <p className="text-xs text-muted-foreground">
                  Usuário comum?{' '}
                  <Link to="/login" className="text-primary hover:underline">
                    Acesse aqui
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </>
  );
}