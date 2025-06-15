
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

export default function PreRegistration() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Interesse registrado!",
        description: "Entraremos em contato em breve.",
      });
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-gradient-to-r from-agro-green to-agro-green-dark">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-8 text-gray-200">
            Junte-se a milhares de compradores que já economizam com nossos genéricos
          </p>
          
          <div className="max-w-md mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-gray-900"
                required
              />
              <Button 
                type="submit"
                className="bg-white text-agro-green hover:bg-gray-100"
              >
                Demonstrar Interesse
              </Button>
            </form>
            
            <div className="mt-6">
              <Button 
                asChild
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-agro-green"
              >
                <Link to="/register">Cadastro Completo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
