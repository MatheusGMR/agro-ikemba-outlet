import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { supabase } from '@/integrations/supabase/client';

interface RepresentativeProtectedRouteProps {
  children: React.ReactNode;
}

export default function RepresentativeProtectedRoute({ children }: RepresentativeProtectedRouteProps) {
  const navigate = useNavigate();
  const { data: representative, isLoading, error } = useCurrentRepresentative();

  console.log('=== REPRESENTATIVE PROTECTED ROUTE ===');
  console.log('Estado atual:', { 
    isLoading, 
    hasRepresentative: !!representative, 
    hasError: !!error,
    errorMessage: error?.message 
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error) {
    console.error('Erro na verificação do representante:', error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erro no Sistema</h1>
          <p className="text-muted-foreground mb-4">
            Ocorreu um erro ao verificar suas permissões de representante.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Erro: {error.message}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => window.location.reload()}
              className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={() => navigate('/')}
              className="block w-full text-primary hover:underline"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!representative) {
    console.log('Usuário autenticado mas não é representante');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Esta área é exclusiva para representantes autorizados.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Você está logado mas sua conta não possui permissões de representante. Entre em contato com o administrador para obter acesso.
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/dashboard')}
              className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Ir para Dashboard
            </button>
            <button 
              onClick={() => navigate('/')}
              className="block w-full text-primary hover:underline"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  console.log('Autenticado, mostrando dashboard de representante...');
  return <>{children}</>;
}