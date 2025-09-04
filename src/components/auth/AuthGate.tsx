import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Users, Zap, Star, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';
import { AuthGateRegistrationForm } from './AuthGateRegistrationForm';
import type { UnifiedRegistrationData } from './UnifiedRegistrationForm';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    tipo: 'produtor',
    conheceu: '',
    emailOrPhone: ''
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsOpen(false);
        // Let the Login page handle smart redirects instead of forcing /products
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setIsOpen(false);
        // Let the Login page handle smart redirects instead of forcing /products
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const handleRegistrationSuccess = (data: UnifiedRegistrationData) => {
    // Switch to login mode after successful registration
    setIsLogin(true);
    setFormData(prev => ({
      ...prev,
      emailOrPhone: data.email,
      password: '',
      confirmPassword: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Forgot Password Flow
      if (isForgotPassword) {
        const email = formData.emailOrPhone.includes('@') 
          ? formData.emailOrPhone 
          : formData.email;

        if (!email || !email.includes('@')) {
          throw new Error('Por favor, informe um e-mail válido');
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`
        });

        if (error) throw error;

        setResendCooldown(35);
        toast({
          title: "E-mail de recuperação enviado",
          description: "Verifique sua caixa de entrada para redefinir sua senha"
        });
        return;
      }

      // First Access - Create password
      if (isFirstAccess) {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        if (formData.password.length < 6) {
          throw new Error('A senha deve ter pelo menos 6 caracteres');
        }

        // Use edge function to create user without email confirmation
        const { data, error } = await supabase.functions.invoke('create-auth-user', {
          body: {
            email: formData.email,
            password: formData.password,
            name: formData.name || formData.email.split('@')[0]
          }
        });

        // Handle non-2xx as graceful email_exists when applicable
        if (error) {
          const msg = (error as any)?.message || '';
          if (msg.includes('email_exists') || msg.includes('409')) {
            setIsForgotPassword(true);
            setFormData(prev => ({ ...prev, emailOrPhone: formData.email }));
            toast({
              title: "E-mail já cadastrado",
              description: "Enviando link de recuperação de senha...",
              variant: "default"
            });
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
              redirectTo: `${window.location.origin}/`
            });
            if (!resetError) {
              setResendCooldown(35);
              toast({
                title: "E-mail de recuperação enviado",
                description: "Verifique sua caixa de entrada para redefinir sua senha"
              });
            }
            return;
          }
          throw error;
        }
        
        // New normalized statuses
        if (data?.status === 'email_exists' || data?.code === 'email_exists' || data?.error?.includes?.('email_exists')) {
          setIsForgotPassword(true);
          setFormData(prev => ({ ...prev, emailOrPhone: formData.email }));
          toast({
            title: "E-mail já cadastrado",
            description: "Enviando link de recuperação de senha...",
            variant: "default"
          });
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(formData.email, {
            redirectTo: `${window.location.origin}/`
          });
          if (!resetError) {
            setResendCooldown(35);
            toast({
              title: "E-mail de recuperação enviado",
              description: "Verifique sua caixa de entrada para redefinir sua senha"
            });
          }
          return;
        }
        
        if (data?.error && !data?.status) throw new Error(data.error);
        
        // Now sign in with the created credentials
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (signInError) throw signInError;

        toast({
          title: "Senha criada com sucesso!",
          description: "Bem-vindo à AgroIkemba"
        });
        return;
      }

      // Login Flow
      if (isLogin) {
        const emailOrPhone = formData.emailOrPhone.trim();
        const isEmail = emailOrPhone.includes('@');

        // Try direct login if email and password provided
        if (isEmail && formData.password) {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: emailOrPhone,
            password: formData.password
          });

          if (!signInError) {
            toast({
              title: "Login realizado com sucesso!",
              description: "Bem-vindo de volta à AgroIkemba"
            });
            return;
          }

          // Handle email not confirmed: resend confirmation email automatically
          if (
            signInError.message?.includes('Email not confirmed') ||
            (signInError as any)?.error_description?.includes?.('Email not confirmed') ||
            (signInError as any)?.code === 'email_not_confirmed'
          ) {
            const redirectUrl = `${window.location.origin}/`;
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: emailOrPhone,
              options: { emailRedirectTo: redirectUrl }
            });

            if (!resendError) {
              toast({
                title: 'Confirmação necessária',
                description: 'Reenviamos o e-mail de confirmação. Verifique sua caixa de entrada.'
              });
            } else {
              toast({
                title: 'Confirmação pendente',
                description: 'Seu e-mail ainda não foi confirmado. Tente novamente em instantes.',
                variant: 'destructive'
              });
            }
            return;
          }

          // If login failed with invalid credentials, check if user exists for first access
          if (signInError.message.includes('Invalid login credentials')) {
            const { data: userData } = await supabase
              .from('users')
              .select('email, name')
              .eq('email', emailOrPhone)
              .eq('status', 'approved')
              .maybeSingle();

            if (userData) {
              setFormData(prev => ({ 
                ...prev, 
                email: userData.email,
                name: userData.name || '',
                password: '',
                confirmPassword: ''
              }));
              setIsFirstAccess(true);
              toast({
                title: "Primeiro acesso detectado",
                description: "Crie sua senha para acessar o sistema"
              });
              return;
            }
          }

          throw signInError;
        }

        // Search user by email or phone in users table
        const normalizedPhone = emailOrPhone.replace(/\D/g, '');
        let query = supabase.from('users').select('*').eq('status', 'approved');
        
        if (isEmail) {
          query = query.eq('email', emailOrPhone);
        } else {
          query = query.or(`phone.eq.${emailOrPhone},phone.eq.${normalizedPhone}`);
        }

        const { data: found, error: findError } = await query.maybeSingle();
        if (findError) throw findError;

        if (found) {
          setFormData(prev => ({ 
            ...prev, 
            email: found.email,
            name: found.name || '',
            emailOrPhone: isEmail ? emailOrPhone : found.email 
          }));
          setIsFirstAccess(true);
          toast({
            title: "Primeiro acesso detectado",
            description: "Crie sua senha para acessar o sistema"
          });
          return;
        } else {
          throw new Error('Usuário não encontrado ou não aprovado. Verifique suas credenciais.');
        }
      }

      // Registration is now handled by UnifiedRegistrationForm component
    } catch (error: any) {
      console.error('Auth error:', error);
      toast({
        title: "Erro",
        description: error.message || 'Ocorreu um erro inesperado',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetToLogin = () => {
    setIsFirstAccess(false);
    setIsForgotPassword(false);
    setIsLogin(true);
    setFormData(prev => ({
      ...prev,
      password: '',
      confirmPassword: ''
    }));
  };

  if (!isOpen) {
    return <div>{children}</div>;
  }

  return (
    <div className="relative">
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <DialogTitle className="sr-only">
            {isForgotPassword ? 'Recuperar Senha' : isFirstAccess ? 'Criar Senha' : isLogin ? 'Fazer Login' : 'Criar Conta'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {isForgotPassword 
              ? 'Recupere sua senha por e-mail'
              : isFirstAccess 
                ? 'Crie sua senha para acessar o sistema'
                : isLogin 
                  ? 'Digite suas credenciais para acessar' 
                  : 'Preencha os dados para criar sua conta'
            }
          </DialogDescription>
          
          <div className="grid md:grid-cols-2 gap-0 bg-background rounded-lg overflow-hidden shadow-2xl">
            {/* Left side - Benefits */}
            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bem-vindo à AgroIkemba</h2>
                  <p className="text-primary-foreground/90">O Outlet de insumos agrícolas do Brasil</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Produtos Certificados</h4>
                      <p className="text-sm text-primary-foreground/80">Produtos originais e com registro MAPA</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Rede de Representantes</h4>
                      <p className="text-sm text-primary-foreground/80">Suporte especializado em todo o país</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Entrega Rápida</h4>
                      <p className="text-sm text-primary-foreground/80">Logística otimizada para sua região</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Melhores Preços</h4>
                      <p className="text-sm text-primary-foreground/80">Descontos progressivos por volume</p>
                    </div>
                  </div>
                </div>

                <div className="text-center pt-4">
                  <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                    + de 317.960 L/Kg em estoque
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right side - Auth Form */}
            <div className="p-8">
              <Card className="border-none shadow-none">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-xl">
                    {isForgotPassword ? 'Recuperar Senha' : isFirstAccess ? 'Criar Senha' : isLogin ? 'Fazer Login' : 'Criar Conta'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isForgotPassword 
                      ? 'Digite seu e-mail para receber as instruções'
                      : isFirstAccess 
                        ? 'Crie sua senha para acessar o sistema'
                        : isLogin 
                          ? 'Acesse sua conta para ver nossos produtos' 
                          : 'Cadastre-se gratuitamente e tenha acesso completo'
                    }
                  </p>
                </CardHeader>

                <CardContent>
                  {!isLogin && !isFirstAccess && !isForgotPassword ? (
                    // Use unified registration form for new registrations
                    <AuthGateRegistrationForm 
                      onSuccess={handleRegistrationSuccess}
                      onSwitchToLogin={() => setIsLogin(true)}
                    />
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Back button for first access and forgot password */}
                    {(isFirstAccess || isForgotPassword) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={resetToLogin}
                        className="flex items-center gap-2 p-0 h-auto"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar ao login
                      </Button>
                      )}

                      {/* Registration fields - Now handled by UnifiedRegistrationForm */}

                      {/* Login and forgot password email field */}
                    {(isLogin || isForgotPassword) && !isFirstAccess && (
                      <div className="space-y-2">
                        <Label htmlFor="emailOrPhone">
                          {isForgotPassword ? 'E-mail' : 'E-mail ou Telefone'}
                        </Label>
                        <Input 
                          id="emailOrPhone" 
                          type="text" 
                          value={formData.emailOrPhone} 
                          onChange={e => handleInputChange('emailOrPhone', e.target.value)} 
                          placeholder={isForgotPassword ? "seu@email.com" : "seu@email.com ou (11) 99999-9999"} 
                          required 
                        />
                      </div>
                    )}

                    {/* Password fields */}
                    {(isLogin || isFirstAccess) && !isForgotPassword && (
                      <div className="space-y-2">
                        <Label htmlFor="password">
                          {isFirstAccess ? 'Nova Senha' : 'Senha'}
                        </Label>
                        <div className="relative">
                          <Input 
                            id="password" 
                            type={showPassword ? "text" : "password"} 
                            value={formData.password} 
                            onChange={e => handleInputChange('password', e.target.value)} 
                            placeholder={isFirstAccess ? "Mínimo 6 caracteres" : "Digite sua senha"} 
                            required 
                            minLength={isFirstAccess ? 6 : undefined}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Confirm password for first access */}
                    {isFirstAccess && (
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          value={formData.confirmPassword} 
                          onChange={e => handleInputChange('confirmPassword', e.target.value)} 
                          placeholder="Digite a senha novamente" 
                          required 
                        />
                      </div>
                    )}

                    {/* Submit button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading || (isForgotPassword && resendCooldown > 0)}
                    >
                      {isLoading ? 'Processando...' : 
                        isForgotPassword ? (resendCooldown > 0 ? `Aguarde ${resendCooldown}s` : 'Enviar E-mail') :
                        isFirstAccess ? 'Criar Senha e Entrar' : 
                        isLogin ? 'Entrar' : 'Cadastrar'}
                    </Button>

                    {/* Action links */}
                    {isLogin && !isFirstAccess && !isForgotPassword && (
                      <div className="text-center space-y-2">
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setIsForgotPassword(true)}
                          className="text-sm"
                        >
                          Esqueci minha senha
                        </Button>
                      </div>
                    )}

                    {/* Toggle login/register */}
                    {!isFirstAccess && !isForgotPassword && (
                      <div className="text-center pt-4">
                        <p className="text-sm text-muted-foreground">
                          {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
                            onClick={() => setIsLogin(!isLogin)}
                            className="p-0 h-auto text-primary"
                          >
                            {isLogin ? 'Cadastre-se' : 'Faça login'}
                          </Button>
                        </p>
                      </div>
                    )}
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}