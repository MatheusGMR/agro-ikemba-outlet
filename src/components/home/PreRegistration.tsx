import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { userService } from '@/services/userService';

const corporateEmailDomains = ['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com'];

const isCorporateEmail = (email: string) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && !corporateEmailDomains.includes(domain);
};

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

const formatCNPJ = (value: string) => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.replace(/^(\d{2})(\d)/, '$1.$2').replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3').replace(/\.(\d{3})(\d)/, '.$1/$2').replace(/(\d{4})(\d)/, '$1-$2').slice(0, 18);
};

const preRegistrationSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  conheceu: z.string().optional(),
  cnpj: z.string().optional()
}).refine((data) => {
  // CNPJ is required ONLY for non-corporate emails (gmail, hotmail, etc.)
  if (!isCorporateEmail(data.email)) {
    return data.cnpj && cnpjRegex.test(data.cnpj);
  }
  // For corporate emails, CNPJ is not required
  return true;
}, {
  message: "CNPJ é obrigatório para emails não corporativos (Gmail, Hotmail, Outlook, etc.) e deve seguir o formato XX.XXX.XXX/XXXX-XX",
  path: ["cnpj"],
});

type PreRegistrationFormValues = z.infer<typeof preRegistrationSchema>;

export default function PreRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCNPJ, setShowCNPJ] = useState(false);

  const form = useForm<PreRegistrationFormValues>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
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

  const onSubmit = async (data: PreRegistrationFormValues) => {
    setIsSubmitting(true);
    console.log('=== INÍCIO DO PRÉ-CADASTRO ===');
    console.log('Dados do pré-cadastro:', data);

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

      // Preparar dados para salvar (incluindo telefone no campo CNPJ se necessário)
      let cnpjField = data.cnpj || '';
      if (!cnpjField) {
        cnpjField = `Empresa: ${data.empresa} | Tel: ${data.telefone}`;
      } else {
        cnpjField = `${data.cnpj} | Empresa: ${data.empresa} | Tel: ${data.telefone}`;
      }

      // Salvar no Supabase
      console.log('Salvando pré-cadastro no Supabase...');
      const { success, error: userError } = await userService.addUser({
        name: data.nome,
        email: data.email,
        tipo: data.tipo,
        conheceu: data.conheceu,
        cnpj: cnpjField
      });

      if (!success || userError) {
        throw new Error(`Erro ao salvar pré-cadastro: ${userError}`);
      }

      // Tentar enviar via Edge Function (não crítico)
      console.log('Tentando enviar emails do pré-cadastro...');
      try {
        const { data: response, error } = await supabase.functions.invoke('send-pre-registration', {
          body: data
        });

        if (error) {
          console.warn('Aviso: Erro na função de pré-cadastro:', error);
        } else if (response?.success) {
          console.log('Emails de pré-cadastro enviados com sucesso');
        } else {
          console.warn('Aviso: Falha no envio de emails do pré-cadastro:', response);
        }
      } catch (emailError) {
        console.warn('Aviso: Erro inesperado no envio de emails do pré-cadastro:', emailError);
      }

      // SEMPRE mostrar sucesso
      console.log('=== PRÉ-CADASTRO CONCLUÍDO COM SUCESSO ===');
      console.log('Pré-cadastro salvo no Supabase para análise do admin');
      
      toast.success('Pré-cadastro enviado com sucesso!', {
        description: 'Sua solicitação foi enviada para análise. Entraremos em contato em breve via WhatsApp.',
      });
      
      form.reset();

    } catch (error) {
      console.error('=== ERRO NO PRÉ-CADASTRO ===');
      console.error('Erro:', error);
      toast.error('Erro ao enviar pré-cadastro. Tente novamente ou entre em contato conosco.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="pre-cadastro" className="py-20 bg-gray-50 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23075e54' fill-opacity='0.1'%3E%3Cpath d='M50 50c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10zm10 0c0-11.046-8.954-20-20-20s-20 8.954-20 20 8.954 20 20 20 20-8.954 20-20z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="container-custom relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua compra de produtos pós patente?
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto">
            Junte-se ao Agro Ikemba hoje e experimente os benefícios de conexões diretas, 
            transações simplificadas e serviços integrados adaptados para a melhora compra de seus genéricos.
          </p>
        </div>
        
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Solicitar acesso antecipado</h3>
            <p className="text-gray-600">
              Seja um dos primeiros a experimentar a revolução no mercado de insumos agrícolas.
            </p>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="nome" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo*</FormLabel>
                  <FormControl>
                    <Input placeholder="Seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail*</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="seu@email.com" {...field} />
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
              )} />

              <FormField control={form.control} name="telefone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone*</FormLabel>
                  <FormControl>
                    <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="empresa" render={({ field }) => (
                <FormItem>
                  <FormLabel>Empresa*</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da sua empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {showCNPJ && (
                <FormField control={form.control} name="cnpj" render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNPJ da Empresa *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        {...field}
                        onChange={(e) => {
                          const formatted = formatCNPJ(e.target.value);
                          field.onChange(formatted);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-gray-500">
                      Necessário apenas para emails pessoais (Gmail, Hotmail, etc.)
                    </p>
                  </FormItem>
                )}
                />
              )}

              <FormField control={form.control} name="tipo" render={({ field }) => (
                <FormItem>
                  <FormLabel>Você é:*</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent side="bottom" align="start">
                        <SelectItem value="Distribuidor">Distribuidor</SelectItem>
                        <SelectItem value="Cooperativa">Cooperativa</SelectItem>
                        <SelectItem value="Fabricante">Fabricante</SelectItem>
                        <SelectItem value="Agricultor">Agricultor</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="conheceu" render={({ field }) => (
                <FormItem>
                  <FormLabel>Como conheceu a Agro Ikemba?</FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma opção" />
                      </SelectTrigger>
                      <SelectContent side="bottom" align="start">
                        <SelectItem value="Linkedin">Linkedin</SelectItem>
                        <SelectItem value="Instagram">Instagram</SelectItem>
                        <SelectItem value="Indicação">Indicação</SelectItem>
                        <SelectItem value="Google">Busca na Internet</SelectItem>
                        <SelectItem value="Evento">Evento</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg" disabled={isSubmitting}>
                {isSubmitting ? 'Enviando...' : 'Enviar pré-cadastro'}
              </Button>
            </form>
          </Form>
          
          <p className="text-sm text-gray-500 text-center mt-6">
            Ao se cadastrar, você concorda com nossos{' '}
            <a href="#" className="text-agro-green hover:underline">Termos de Serviço</a>
            {' '}e{' '}
            <a href="#" className="text-agro-green hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </section>
  );
}
