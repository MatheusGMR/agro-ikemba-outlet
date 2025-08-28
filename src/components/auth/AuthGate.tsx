import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Users, Zap, Star, Eye, EyeOff } from 'lucide-react';
interface AuthGateProps {
  children: React.ReactNode;
}
export default function AuthGate({
  children
}: AuthGateProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [isFirstAccess, setIsFirstAccess] = useState(false);
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    password: '',
    confirmPassword: '',
    tipo: 'produtor',
    conheceu: '',
    emailOrPhone: '' // Campo para login com email ou telefone
  });
  useEffect(() => {
    const checkUser = async () => {
      // Verificar autenticação do Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsOpen(false);
      } else {
        // Verificar se há usuário no localStorage (cadastro sem senha)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsOpen(false);
        }
      }
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsOpen(false);
      } else {
        const savedUser = localStorage.getItem('currentUser');
        if (!savedUser) {
          setUser(null);
          setIsOpen(true);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        // Verificar se é primeiro acesso buscando por email ou telefone
        const emailOrPhone = formData.emailOrPhone;
        const isEmail = emailOrPhone.includes('@');
        
        let userData;
        if (isEmail) {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('email', emailOrPhone)
            .eq('status', 'approved')
            .single();
          userData = data;
        } else {
          const { data } = await supabase
            .from('users')
            .select('*')
            .eq('phone', emailOrPhone)
            .eq('status', 'approved')
            .single();
          userData = data;
        }

        if (userData) {
          // Verificar se já tem conta no Supabase Auth
          if (isEmail) {
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
          }
          
          // Se não conseguiu fazer login, é primeiro acesso
          setIsFirstAccess(true);
          // Preencher o email do usuário encontrado
          setFormData(prev => ({ ...prev, email: userData.email }));
          toast({
            title: "Primeiro acesso detectado",
            description: "Por favor, crie sua senha para acessar o sistema"
          });
        } else {
          throw new Error('Usuário não encontrado ou não aprovado');
        }
      } else if (isFirstAccess) {
        // Criar senha no primeiro acesso
        if (formData.password !== formData.confirmPassword) {
          throw new Error('As senhas não coincidem');
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        toast({
          title: "Senha criada com sucesso!",
          description: "Verifique seu email para confirmar sua conta"
        });
        setIsFirstAccess(false);
        setIsLogin(true);
      } else {
        // Cadastro sem senha
        const { error } = await supabase.from('users').insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          tipo: formData.tipo,
          conheceu: formData.conheceu
        });
        
        if (error) throw error;

        // Simular login temporário até aprovação
        const tempUser = { email: formData.email, isTemp: true };
        setUser(tempUser);
        localStorage.setItem('currentUser', JSON.stringify(tempUser));
        setIsOpen(false);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você já pode fazer login no sistema!"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  if (!isOpen) {
    return <>{children}</>;
  }
  return <div className="relative">
      {/* Blurred background */}
      <div className="filter blur-sm pointer-events-none select-none">
        {children}
      </div>

      {/* Auth Modal */}
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
          <div className="grid md:grid-cols-2 gap-0 bg-background rounded-lg overflow-hidden shadow-2xl">
            
            {/* Left side - Benefits */}
            <div className="bg-gradient-to-br from-primary to-primary/80 p-8 text-primary-foreground">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-2">Bem-vindo à AgroIkemba</h2>
                  <p className="text-primary-foreground/90">O Outlet de insumos agricolas do Brasil</p>
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
                      <p className="text-sm text-primary-foreground/80">
                        Suporte especializado em todo o país
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Entrega Rápida</h4>
                      <p className="text-sm text-primary-foreground/80">
                        Logística otimizada para sua região
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <Star className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Melhores Preços</h4>
                      <p className="text-sm text-primary-foreground/80">
                        Descontos progressivos por volume
                      </p>
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
                    {isFirstAccess ? 'Criar Senha' : isLogin ? 'Fazer Login' : 'Criar Conta'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isFirstAccess 
                      ? 'Crie sua senha para acessar o sistema'
                      : isLogin 
                        ? 'Acesse sua conta para ver nossos produtos' 
                        : 'Cadastre-se gratuitamente e tenha acesso completo'
                    }
                  </p>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input id="name" type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Seu nome completo" required={!isLogin} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company">Empresa</Label>
                          <Input id="company" type="text" value={formData.company} onChange={e => handleInputChange('company', e.target.value)} placeholder="Nome da sua empresa" required={!isLogin} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input id="phone" type="tel" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} placeholder="(11) 99999-9999" required={!isLogin} />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">E-mail</Label>
                          <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="seu@email.com" required />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipo">Você é:</Label>
                          <select id="tipo" value={formData.tipo} onChange={e => handleInputChange('tipo', e.target.value)} className="w-full px-3 py-2 border border-input bg-background rounded-md" required={!isLogin}>
                            <option value="produtor">Produtor Rural</option>
                            <option value="distribuidor">Distribuidor</option>
                            <option value="cooperativa">Cooperativa</option>
                            <option value="representante">Representante Comercial</option>
                          </select>
                        </div>
                      </>}

                    {isLogin && !isFirstAccess && (
                      <div className="space-y-2">
                        <Label htmlFor="emailOrPhone">E-mail ou Telefone</Label>
                        <Input 
                          id="emailOrPhone" 
                          type="text" 
                          value={formData.emailOrPhone} 
                          onChange={e => handleInputChange('emailOrPhone', e.target.value)} 
                          placeholder="seu@email.com ou (11) 99999-9999" 
                          required 
                        />
                      </div>
                    )}

                    {(isLogin || isFirstAccess) && <div className="space-y-2">
                      <Label htmlFor="password">{isFirstAccess ? 'Nova Senha' : 'Senha'}</Label>
                      <div className="relative">
                        <Input 
                          id="password" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.password} 
                          onChange={e => handleInputChange('password', e.target.value)} 
                          placeholder={isFirstAccess ? "Crie sua senha" : "Sua senha"} 
                          required 
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>}

                    {isFirstAccess && <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <div className="relative">
                        <Input 
                          id="confirmPassword" 
                          type={showPassword ? "text" : "password"} 
                          value={formData.confirmPassword} 
                          onChange={e => handleInputChange('confirmPassword', e.target.value)} 
                          placeholder="Confirme sua senha" 
                          required 
                        />
                      </div>
                    </div>}

                    {!isLogin && <div className="space-y-2">
                        <Label htmlFor="conheceu">Como nos conheceu? (opcional)</Label>
                        <select id="conheceu" value={formData.conheceu} onChange={e => handleInputChange('conheceu', e.target.value)} className="w-full px-3 py-2 border border-input bg-background rounded-md">
                          <option value="">Selecione uma opção</option>
                          <option value="google">Google</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="indicacao">Indicação</option>
                          <option value="representante">Representante</option>
                          <option value="evento">Evento/Feira</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading 
                        ? 'Processando...' 
                        : isFirstAccess 
                          ? 'Criar Senha' 
                          : isLogin 
                            ? 'Entrar' 
                            : 'Criar Conta'
                      }
                    </Button>

                    {!isFirstAccess && <div className="text-center">
                      <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                        {isLogin ? 'Não tem conta? Cadastre-se grátis' : 'Já tem conta? Fazer login'}
                      </button>
                    </div>}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}