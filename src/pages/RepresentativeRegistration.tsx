import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RepresentativeService } from '@/services/representativeService';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function RepresentativeRegistration() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '',
    cpf: '',
    region: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsLoading(true);

    try {
      // First, create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/representative`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Check if representative already exists with this email
        const { data: existingRep, error: repError } = await supabase
          .from('representatives')
          .select('*')
          .eq('email', formData.email)
          .maybeSingle();

        if (repError && repError.code !== 'PGRST116') {
          throw repError;
        }

        if (existingRep) {
          // Link existing representative to the new user
          const { error: updateError } = await supabase
            .from('representatives')
            .update({ 
              user_id: authData.user.id,
              name: formData.name || existingRep.name,
              phone: formData.phone || existingRep.phone,
              cpf: formData.cpf || existingRep.cpf,
              region: formData.region || existingRep.region
            })
            .eq('id', existingRep.id);

          if (updateError) throw updateError;
          
          toast.success('Conta vinculada com sucesso! Verifique seu email para confirmar.');
        } else {
          // Create new representative
          await RepresentativeService.createRepresentative({
            user_id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            cpf: formData.cpf,
            region: formData.region,
            commission_percentage: 1.0,
            status: 'active'
          });
          
          toast.success('Representante cadastrado com sucesso! Aguarde aprovação e verifique seu email.');
        }

        navigate('/representative/login');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      if (error.message?.includes('User already registered')) {
        toast.error('Este email já está cadastrado. Faça login ou use outro email.');
      } else if (error.message?.includes('Invalid email')) {
        toast.error('Email inválido. Verifique o formato do email.');
      } else {
        toast.error('Erro ao cadastrar representante. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <Helmet>
        <title>Cadastro de Representante - AgroIkemba</title>
        <meta name="description" content="Cadastre-se como representante AgroIkemba e comece a vender nossos produtos agrícolas." />
      </Helmet>

      <Navbar />
      
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Cadastro de Representante</CardTitle>
            <CardDescription>
              Preencha os dados para se cadastrar como representante
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange('name')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={handleInputChange('cpf')}
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">Região</Label>
                <Input
                  id="region"
                  type="text"
                  value={formData.region}
                  onChange={handleInputChange('region')}
                  placeholder="Ex: São Paulo - Interior"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange('password')}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Cadastrando...' : 'Cadastrar Representante'}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
              <span className="text-muted-foreground">Já tem conta? </span>
              <Button variant="link" onClick={() => navigate('/representative/login')} className="p-0">
                Fazer login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </>
  );
}