import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShieldCheck, Users, Zap, Star } from 'lucide-react';
interface AuthGateProps {
  children: React.ReactNode;
}
export default function AuthGate({
  children
}: AuthGateProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    tipo: 'produtor',
    conheceu: ''
  });
  useEffect(() => {
    const checkUser = async () => {
      // Verificar se há usuário no localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setIsOpen(false);
      }
    };
    checkUser();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isLogin) {
        // Para login, usar email como identificador
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('email', formData.email)
          .single();

        if (userError || !userData) {
          throw new Error('Usuário não encontrado');
        }

        // Simular login sem senha - apenas definir o usuário como logado
        setUser({ email: userData.email } as any);
        setIsOpen(false);
        
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta à AgroIkemba"
        });
      } else {
        // Adicionar usuário à tabela users sem autenticação do Supabase
        const { error } = await supabase.from('users').insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          tipo: formData.tipo,
          conheceu: formData.conheceu
        });
        
        if (error) throw error;

        // Simular cadastro sem autenticação
        setUser({ email: formData.email });
        localStorage.setItem('currentUser', JSON.stringify({ email: formData.email }));
        setIsOpen(false);
        
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Bem-vindo à AgroIkemba!"
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
                    {isLogin ? 'Fazer Login' : 'Criar Conta'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {isLogin ? 'Acesse sua conta para ver nossos produtos' : 'Cadastre-se gratuitamente e tenha acesso completo'}
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
                          <Label htmlFor="tipo">Você é:</Label>
                          <select id="tipo" value={formData.tipo} onChange={e => handleInputChange('tipo', e.target.value)} className="w-full px-3 py-2 border border-input bg-background rounded-md" required={!isLogin}>
                            <option value="produtor">Produtor Rural</option>
                            <option value="distribuidor">Distribuidor</option>
                            <option value="cooperativa">Cooperativa</option>
                            <option value="representante">Representante Comercial</option>
                          </select>
                        </div>
                      </>}

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} placeholder="seu@email.com" required />
                    </div>

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
                      {isLoading ? 'Processando...' : isLogin ? 'Entrar' : 'Criar Conta'}
                    </Button>

                    <div className="text-center">
                      <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-primary hover:underline">
                        {isLogin ? 'Não tem conta? Cadastre-se grátis' : 'Já tem conta? Fazer login'}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>;
}