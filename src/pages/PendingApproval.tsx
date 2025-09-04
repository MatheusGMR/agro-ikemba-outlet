import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserApproval } from '@/hooks/useUserApproval';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, LogOut, CheckCircle, Mail, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function PendingApproval() {
  const { user } = useAuth();
  const { isApproved, isPending, isLoading, userRecord } = useUserApproval();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!isLoading && isApproved) {
      // Use the same smart redirect logic - go back to where user was trying to go
      const redirectPath = localStorage.getItem('redirectAfterLogin') || '/products';
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath);
      return;
    }
  }, [user, isApproved, isLoading, navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso"
      });
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!user || isLoading) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-xl animate-fade-in">
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Success Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              {/* Welcome Message */}
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Login realizado com sucesso!
                </h1>
                <p className="text-lg text-gray-600">
                  Olá {userRecord?.name || user.email}, sua conta foi criada e está sendo analisada por nossa equipe.
                </p>
              </div>
              
              {/* Status Badge */}
              <div className="flex justify-center">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Aprovação Pendente
                </Badge>
              </div>
              
              {/* Information Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left space-y-4">
                <h3 className="font-semibold text-blue-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  O que acontece agora?
                </h3>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Nossa equipe está analisando suas informações
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Você receberá um email assim que sua conta for aprovada
                  </li>
                  <li className="flex items-start">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    Após aprovação, você terá acesso completo aos produtos e preços
                  </li>
                </ul>
              </div>
              
              {/* Contact Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Precisa de ajuda ou quer agilizar o processo?
                </h3>
                <div className="flex justify-center">
                  <a 
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center text-primary hover:text-primary/80 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </a>
                </div>
              </div>
              
              {/* User Information */}
              {userRecord && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Email:</strong> {userRecord.email}</p>
                  <p><strong>Tipo:</strong> {userRecord.tipo}</p>
                  {userRecord.company && <p><strong>Empresa:</strong> {userRecord.company}</p>}
                </div>
              )}
              
              {/* Actions */}
              <div className="flex flex-col gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair da conta
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/')}
                  className="w-full"
                >
                  Voltar ao início
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}