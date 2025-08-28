import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, ShieldCheck, Users, Zap, Star } from 'lucide-react';

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    tipo: 'produtor',
    conheceu: ''
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setIsOpen(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsOpen(false);
      } else {
        setUser(null);
        setIsOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta à AgroIkemba"
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        // Adicionar usuário à tabela users
        await supabase.from('users').insert({
          name: formData.name,
          email: formData.email,
          tipo: formData.tipo,
          conheceu: formData.conheceu
        });

        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar sua conta"
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
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
                  <p className="text-primary-foreground/90">
                    A maior plataforma de defensivos agrícolas do Brasil
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-foreground/20 rounded-full">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">Produtos Certificados</h4>
                      <p className="text-sm text-primary-foreground/80">
                        Todos os produtos com registro MAPA
                      </p>
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
                    {isLogin ? 'Fazer Login' : 'Criar Conta'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isLogin 
                      ? 'Acesse sua conta para ver nossos produtos'
                      : 'Cadastre-se gratuitamente e tenha acesso completo'
                    }
                  </p>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="name">Nome Completo</Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="Seu nome completo"
                            required={!isLogin}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="tipo">Você é:</Label>
                          <select
                            id="tipo"
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                            className="w-full px-3 py-2 border border-input bg-background rounded-md"
                            required={!isLogin}
                          >
                            <option value="produtor">Produtor Rural</option>
                            <option value="distribuidor">Distribuidor</option>
                            <option value="cooperativa">Cooperativa</option>
                            <option value="representante">Representante Comercial</option>
                          </select>
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="seu@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Senha</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => handleInputChange('password', e.target.value)}
                          placeholder="Sua senha"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {!isLogin && (
                      <div className="space-y-2">
                        <Label htmlFor="conheceu">Como nos conheceu? (opcional)</Label>
                        <select
                          id="conheceu"
                          value={formData.conheceu}
                          onChange={(e) => handleInputChange('conheceu', e.target.value)}
                          className="w-full px-3 py-2 border border-input bg-background rounded-md"
                        >
                          <option value="">Selecione uma opção</option>
                          <option value="google">Google</option>
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="indicacao">Indicação</option>
                          <option value="representante">Representante</option>
                          <option value="evento">Evento/Feira</option>
                          <option value="outros">Outros</option>
                        </select>
                      </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-primary hover:underline"
                      >
                        {isLogin 
                          ? 'Não tem conta? Cadastre-se grátis'
                          : 'Já tem conta? Fazer login'
                        }
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}