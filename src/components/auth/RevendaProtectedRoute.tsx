import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentRevenda } from '@/hooks/useRevenda';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

interface RevendaProtectedRouteProps {
  children: React.ReactNode;
}

export default function RevendaProtectedRoute({ children }: RevendaProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: revenda, isLoading: revendaLoading, error } = useCurrentRevenda();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || revendaLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <LoadingFallback />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-destructive">Erro de Acesso</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar os dados da revenda.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  if (!revenda) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Acesso Negado</h2>
          <p className="text-muted-foreground">
            Você precisa ter permissões de revenda para acessar esta área.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}