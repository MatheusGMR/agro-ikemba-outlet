
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Mail, User, Lock, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  email: z.string().email({ message: 'Email inválido' }),
  password: z.string().min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Senhas não conferem",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

// Function to generate a verification code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export default function Registration() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [userCode, setUserCode] = useState('');
  const [userData, setUserData] = useState<FormValues | null>(null);
  
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
    // In a real application, send verification email here
    const code = generateVerificationCode();
    setVerificationCode(code);
    setUserData(data);
    setIsVerifying(true);
    
    // Simulate email sent notification
    toast.info(
      `Código de verificação enviado para ${data.email}`,
      { description: `O código é: ${code}` } // In a real app, wouldn't show this here
    );
  };

  const handleVerification = () => {
    if (userCode === verificationCode) {
      if (userData) {
        // Store user data (in a real app, send to backend)
        localStorage.setItem('user', JSON.stringify({
          name: userData.name,
          email: userData.email,
          verified: true
        }));
        
        toast.success('Cadastro realizado com sucesso!');
        navigate('/products'); // Redirect to products page after verification
      }
    } else {
      toast.error('Código de verificação inválido');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-agro-neutral py-12">
        <div className="container mx-auto px-4 max-w-md">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-center mb-8">
              <span className="text-black">Cadastro </span>
              <span className="text-agro-green">Agro Ikemba</span>
            </h1>

            {!isVerifying ? (
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
                        <FormDescription>
                          Enviaremos um código de verificação para este email
                        </FormDescription>
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
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-medium text-center">Verificação de Email</h2>
                <p className="text-gray-600 text-center">
                  Digite o código de 6 dígitos enviado para {userData?.email}
                </p>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="000000"
                    maxLength={6}
                    className="text-center text-xl tracking-widest"
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                  />
                  
                  <Button 
                    onClick={handleVerification}
                    className="w-full bg-agro-green hover:bg-agro-green-light text-white"
                  >
                    Verificar
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full border-agro-earth text-agro-earth"
                    onClick={() => setIsVerifying(false)}
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
