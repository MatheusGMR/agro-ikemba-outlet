
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
const preRegistrationSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório'),
  empresa: z.string().min(1, 'Empresa é obrigatória'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  conheceu: z.string().optional()
});
type PreRegistrationFormValues = z.infer<typeof preRegistrationSchema>;
export default function PreRegistration() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<PreRegistrationFormValues>({
    resolver: zodResolver(preRegistrationSchema),
    defaultValues: {
      nome: '',
      email: '',
      telefone: '',
      empresa: '',
      tipo: '',
      conheceu: ''
    }
  });
  const onSubmit = async (data: PreRegistrationFormValues) => {
    setIsSubmitting(true);
    try {
      // Simular envio para FormSubmit.co
      console.log('Dados do pré-cadastro:', data);

      // Em um ambiente real, os dados seriam enviados para o endpoint
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value || '');
      });
      toast.success('Pré-cadastro enviado com sucesso!');
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar pré-cadastro:', error);
      toast.error('Erro ao enviar pré-cadastro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };
  return <section id="pre-cadastro" className="py-20 bg-gray-50">
      <div className="container-custom">
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
              <FormField control={form.control} name="nome" render={({
              field
            }) => <FormItem>
                    <FormLabel>Nome completo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="email" render={({
              field
            }) => <FormItem>
                    <FormLabel>E-mail*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="telefone" render={({
              field
            }) => <FormItem>
                    <FormLabel>Telefone*</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(11) 99999-9999" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="empresa" render={({
              field
            }) => <FormItem>
                    <FormLabel>Empresa*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da sua empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="tipo" render={({
              field
            }) => <FormItem>
                    <FormLabel>Você é:*</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <FormField control={form.control} name="conheceu" render={({
              field
            }) => <FormItem>
                    <FormLabel>Como conheceu a Agro Ikemba?</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
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
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />

              <Button type="submit" className="w-full bg-agro-green hover:bg-agro-green-dark text-white py-3 text-lg" disabled={isSubmitting}>
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
    </section>;
}
