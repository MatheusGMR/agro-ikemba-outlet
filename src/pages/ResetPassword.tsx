import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');

  // Extract token parameters from URL
  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const type = searchParams.get('type');

  useEffect(() => {
    const validateToken = async () => {
      // Check if this is a password reset link
      if (type !== 'recovery' || !accessToken) {
        setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
        setIsValidating(false);
        return;
      }

      try {
        // Verify the session with the tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('Token validation error:', error);
          setError('Link inválido ou expirado. Solicite um novo link de recuperação.');
        } else if (data.session) {
          setTokenValid(true);
        } else {
          setError('Sessão inválida. Solicite um novo link de recuperação.');
        }
      } catch (err) {
        console.error('Validation error:', err);
        setError('Erro ao validar o link. Tente novamente.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [accessToken, refreshToken, type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      setError('Preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        throw error;
      }

      toast.success('Senha alterada com sucesso!');
      
      // Wait a moment for the success message, then redirect
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);

    } catch (error: any) {
      console.error('Password reset error:', error);
      setError(error.message || 'Erro ao alterar senha. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const requestNewLink = () => {
    navigate('/login');
  };

  if (isValidating) {
    return (
      <div className="flex flex-col min-h-screen">
        <Helmet>
          <title>Redefinindo Senha - AgroIkemba</title>
          <meta name="description" content="Redefina sua senha de acesso ao AgroIkemba" />
        </Helmet>
        <Navbar />
        <main className="flex-1 bg-agro-neutral py-12">
          <div className="container mx-auto px-4 max-w-md">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agro-green mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold mb-2">Validando link...</h1>
                <p className="text-gray-600">Aguarde enquanto verificamos seu link de recuperação</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Helmet>
        <title>Redefinir Senha - AgroIkemba</title>
        <meta name="description" content="Redefina sua senha de acesso ao AgroIkemba" />
      </Helmet>
      <Navbar />
      <main className="flex-1 bg-agro-neutral py-12">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="shadow-md">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {tokenValid ? (
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <span className="text-black">Nova </span>
                    <span className="text-agro-green">Senha</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <span className="text-red-600">Link Inválido</span>
                  </div>
                )}
              </CardTitle>
              <p className="text-gray-600">
                {tokenValid 
                  ? 'Defina uma nova senha segura para sua conta'
                  : 'O link de recuperação não é válido ou expirou'
                }
              </p>
            </CardHeader>

            <CardContent>
              {!tokenValid ? (
                <div className="space-y-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  
                  <Button 
                    onClick={requestNewLink}
                    className="w-full"
                    variant="outline"
                  >
                    Solicitar Novo Link
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua nova senha"
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirme sua nova senha"
                        className="pr-10"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">Sua senha deve ter:</p>
                    <ul className="text-xs space-y-1">
                      <li className={password.length >= 6 ? 'text-green-600' : 'text-gray-500'}>
                        • Pelo menos 6 caracteres
                      </li>
                      <li className={password === confirmPassword && password ? 'text-green-600' : 'text-gray-500'}>
                        • Confirmação deve coincidir
                      </li>
                    </ul>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Alterando...' : 'Alterar Senha'}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="link"
                      onClick={requestNewLink}
                      className="text-sm"
                    >
                      Voltar ao Login
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}