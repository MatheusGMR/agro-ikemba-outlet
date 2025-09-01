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

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('RepresentativeProtectedRoute - User check:', !!user);
      if (!user) {
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  console.log('RepresentativeProtectedRoute - State:', {
    isLoading,
    hasRepresentative: !!representative,
    error: error?.message
  });

  if (isLoading) {
    console.log('RepresentativeProtectedRoute - Still loading...');
    return <LoadingFallback />;
  }

  if (error || !representative) {
    console.log('RepresentativeProtectedRoute - Access denied:', { error: error?.message, representative: !!representative });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md mx-auto p-6">
          <h1 className="text-2xl font-bold text-foreground mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-4">
            Esta área é exclusiva para representantes autorizados.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Entre em contato com o administrador para obter acesso como representante.
          </p>
          <button 
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}