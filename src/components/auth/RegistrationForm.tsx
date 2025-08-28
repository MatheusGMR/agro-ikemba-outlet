import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, User, Lock, Check, Clock, Users, MessageSquare, Building, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegistrationFormFields } from './RegistrationFormFields';
import { toast } from 'sonner';
import { formSchema } from '@/lib/validations/auth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from '@/integrations/supabase/client';
import { userService } from '@/services/userService';

type FormValues = z.infer<typeof formSchema>;

const formatCNPJ = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
};

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      tipo: '',
      conheceu: '',
      cnpj: ''
    }
  });

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
      // Verificar se email já existe
      const { exists, error: checkError } = await userService.checkEmailExists(data.email);
      if (checkError) {
        throw new Error(`Erro ao verificar email: ${checkError}`);
      }
      
      if (exists) {
        toast.error('Este email já está cadastrado!');
        setIsSubmitting(false);
        return;
      }

      // Adicionar usuário ao Supabase
      console.log('Salvando usuário no Supabase...');
      const { success, error: userError, user } = await userService.addUser({
        name: data.name,
        email: data.email,
        tipo: data.tipo,
        conheceu: data.conheceu,
        cnpj: data.cnpj || undefined,
        phone: data.phone,
        company: data.company
      });

      if (!success || userError) {
        throw new Error(`Erro ao salvar usuário: ${userError}`);
      }

      // Armazenar dados do usuário localmente para navegação
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
          cnpj: data.cnpj || undefined,
          phone: data.phone,
          company: data.company
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

      // SEMPRE mostrar sucesso
      console.log('=== CADASTRO CONCLUÍDO COM SUCESSO ===');
      console.log('Usuário salvo no Supabase para aprovação do admin');
      
      setShowConfirmation(true);

      setTimeout(() => {
        setShowConfirmation(false);
        toast.success('Solicitação de cadastro enviada com sucesso!');
        navigate('/products');
      }, 5000);

    } catch (error) {
      console.error('=== ERRO CRÍTICO NO CADASTRO ===');
      console.error('Erro:', error);
      toast.error('Erro ao processar cadastro. Tente novamente ou entre em contato conosco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <RegistrationFormFields 
          form={form} 
          formatCNPJ={formatCNPJ}
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
