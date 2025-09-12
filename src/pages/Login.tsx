import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Lock, Mail, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { RepresentativeService } from '@/services/representativeService';
import { supabase } from '@/integrations/supabase/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, user } = useAuth();

  // Get redirect path based on user status and role
  const getRedirectPath = (userStatus: string, isRepresentative: boolean) => {
    if (userStatus === 'approved') {
      if (isRepresentative) {
        return '/representative';
      }
      // For regular users, get the path they were trying to access or default to products
      const from = location.state?.from?.pathname || localStorage.getItem('redirectAfterLogin');
      localStorage.removeItem('redirectAfterLogin');
      return from && from !== '/login' ? from : '/products';
    } else {
      return '/pending-approval';
    }
  };

  // Remove conflicting redirect - let handleLogin manage redirection based on user type

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
        // Login successful - check user status and redirect appropriately
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            await new Promise((r) => setTimeout(r, 200));
          }
          
          // Check if user is a representative first
          const representative = await RepresentativeService.getCurrentRepresentative();
          const isRepresentative = !!representative;
          
          // Check user approval status
          const { data: userData } = await supabase
            .from('users')
            .select('status')
            .eq('email', email)
            .maybeSingle();
          
          const userStatus = userData?.status || 'pending';
          const redirectPath = getRedirectPath(userStatus, isRepresentative);
          navigate(redirectPath);
        } catch (repError) {
          console.log('Error checking user status, redirecting to pending approval:', repError);
          navigate('/pending-approval');
        }
      }
    } catch (error) {
      console.error('Erro durante login:', error);
      setError('Erro interno. Tente novamente.');
      toast.error('Erro interno. Tente novamente.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
            <p className="text-gray-600">Entre com suas credenciais</p>
            
            {/* Information about approval process */}
            <Alert className="mt-4 text-left">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <strong>Primeira vez?</strong> Após o login, sua conta passará por um processo de aprovação. 
                Quando aprovada, você será redirecionado para o catálogo de produtos ou para onde estava navegando.
              </AlertDescription>
            </Alert>
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
                    placeholder="Digite seu email"
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
            
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Não tem uma conta?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Cadastre-se
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}