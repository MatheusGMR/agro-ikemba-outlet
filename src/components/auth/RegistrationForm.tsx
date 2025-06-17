
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, User, Lock, Check, Clock, Users, MessageSquare, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { formSchema } from '@/lib/validations/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { addPendingUser } from '@/utils/adminStorage';

type FormValues = z.infer<typeof formSchema>;

const corporateEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com'];

const isCorporateEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !corporateEmailDomains.includes(domain);
};

const formatCNPJ = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
};

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCNPJ, setShowCNPJ] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      tipo: '',
      conheceu: '',
      cnpj: ''
    }
  });

  const watchEmail = form.watch('email');

  useEffect(() => {
    if (watchEmail) {
      const needsCNPJ = !isCorporateEmail(watchEmail);
      setShowCNPJ(needsCNPJ);
      if (!needsCNPJ) {
        form.setValue('cnpj', '');
      }
    }
  }, [watchEmail, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    console.log('=== INÍCIO DO PROCESSO DE CADASTRO ===');
    console.log('Dados do formulário:', {
      name: data.name,
      email: data.email,
      tipo: data.tipo,
      conheceu: data.conheceu,
      cnpj: data.cnpj ? '***FORNECIDO***' : 'Não fornecido'
    });

    try {
      // SEMPRE adicionar ao painel admin primeiro
      console.log('Adicionando usuário ao painel admin...');
      addPendingUser({
        name: data.name,
        email: data.email,
        tipo: data.tipo,
        conheceu: data.conheceu,
        cnpj: data.cnpj
      });
      
      // Armazenar dados do usuário localmente
      console.log('Salvando dados do usuário no localStorage...');
      localStorage.setItem('user', JSON.stringify({
        name: data.name,
        email: data.email,
        tipo: data.tipo,
        conheceu: data.conheceu,
        cnpj: data.cnpj,
        verified: false,
        submittedAt: new Date().toISOString()
      }));

      // Tentar enviar emails via Edge Function (não crítico)
      console.log('Tentando enviar emails...');
      try {
        const registrationData = {
          name: data.name,
          email: data.email,
          tipo: data.tipo,
          conheceu: data.conheceu,
          cnpj: data.cnpj
        };

        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-registration', {
          body: registrationData
        });

        if (emailError) {
          console.warn('Aviso: Erro no envio de emails:', emailError);
        } else if (emailResult?.success) {
          console.log('Emails enviados com sucesso');
        } else {
          console.warn('Aviso: Falha no envio de emails:', emailResult);
        }
      } catch (emailError) {
        console.warn('Aviso: Erro inesperado no envio de emails:', emailError);
      }

      // SEMPRE mostrar sucesso, independentemente dos emails
      console.log('=== CADASTRO CONCLUÍDO COM SUCESSO ===');
      console.log('Usuário adicionado ao painel admin para aprovação');
      
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        toast.success('Solicitação de cadastro enviada com sucesso!');
        navigate('/products');
      }, 5000);

    } catch (error) {
      console.error('=== ERRO CRÍTICO NO CADASTRO ===');
      console.error('Erro:', error);
      toast.error('Erro inesperado. Seus dados foram salvos para análise. Tente novamente ou entre em contato conosco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome Completo</FormLabel>
                <FormControl>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Seu nome completo" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="seu@email.com" type="email" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
                {watchEmail && !isCorporateEmail(watchEmail) && (
                  <p className="text-sm text-amber-600">
                    Como você está usando um email pessoal (Gmail, Hotmail, etc.), será necessário informar o CNPJ da empresa.
                  </p>
                )}
                {watchEmail && isCorporateEmail(watchEmail) && (
                  <p className="text-sm text-green-600">
                    Email corporativo identificado. CNPJ não é necessário.
                  </p>
                )}
              </FormItem>
            )}
          />

          {showCNPJ && (
            <FormField
              control={form.control}
              name="cnpj"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CNPJ da Empresa *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        className="pl-10"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <p className="text-sm text-gray-500">
                    Necessário apenas para emails pessoais (Gmail, Hotmail, etc.)
                  </p>
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Você é: *</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                        <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="Fabricante">Fabricante</SelectItem>
                        <SelectItem value="Agricultor">Agricultor</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="conheceu"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Como conheceu a Agro Ikemba?</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Linkedin">Linkedin</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="Google">Busca na Internet</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="******" type="password" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar Senha</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Check className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="******" type="password" className="pl-10" {...field} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary hover:bg-primary/90 text-gray-50"
          >
            {isSubmitting ? 'Enviando...' : 'Solicitar Aprovação'}
          </Button>
        </form>
      </Form>

      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Solicitação Enviada</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-agro-green/10 p-3">
                  <Clock className="h-6 w-6 text-agro-green" />
                </div>
                <div className="text-center">
                  Sua solicitação de cadastro foi enviada para análise. 
                  <p className="mt-1 text-gray-500">
                    O administrador será notificado e você receberá uma resposta em até 24 horas.
                  </p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
