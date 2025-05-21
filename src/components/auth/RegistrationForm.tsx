
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, User, Lock, Check, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { formSchema } from '@/lib/validations/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof formSchema>;

export default function RegistrationForm() {
  const navigate = useNavigate();
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = (data: FormValues) => {
    // Mostrar o diálogo de confirmação
    setShowConfirmation(true);
    
    // Armazenar dados do usuário
    localStorage.setItem('user', JSON.stringify({
      name: data.name,
      email: data.email,
      verified: true
    }));
    
    // Definir um temporizador para fechar o diálogo após 5 segundos
    setTimeout(() => {
      setShowConfirmation(false);
      toast.success('Cadastro realizado com sucesso!');
      navigate('/products');
    }, 5000);
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
                    <Input 
                      placeholder="Seu nome completo" 
                      className="pl-10" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="seu@email.com"
                      type="email" 
                      className="pl-10" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="******" 
                      type="password" 
                      className="pl-10" 
                      {...field} 
                    />
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
                    <Input 
                      placeholder="******" 
                      type="password" 
                      className="pl-10" 
                      {...field} 
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full bg-agro-green hover:bg-agro-green-light text-white"
          >
            Cadastrar
          </Button>
        </form>
      </Form>

      {/* Diálogo de confirmação */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Cadastro Enviado</DialogTitle>
            <DialogDescription className="text-center pt-4">
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-full bg-agro-green/10 p-3">
                  <Clock className="h-6 w-6 text-agro-green" />
                </div>
                <div className="text-center">
                  Seu acesso será analisado em poucas horas. 
                  <p className="mt-1 text-gray-500">
                    Entraremos em contato pelo seu e-mail cadastrado.
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
