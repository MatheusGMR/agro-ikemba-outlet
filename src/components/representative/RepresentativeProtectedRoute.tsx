import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { useAuth } from '@/hooks/useAuth';

interface RepresentativeProtectedRouteProps {
  children: React.ReactNode;
}

export default function RepresentativeProtectedRoute({ children }: RepresentativeProtectedRouteProps) {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { data: representative, isLoading: repLoading, error } = useCurrentRepresentative();

  console.log('RepresentativeProtectedRoute - State:', {
    user: !!user,
    authLoading,
    repLoading,
    hasRepresentative: !!representative,
    error: error?.message
  });

  // Show loading while authentication or representative data is loading
  if (authLoading || repLoading) {
    console.log('RepresentativeProtectedRoute - Loading...');
    return <LoadingFallback />;
  }

  // Redirect to representative login if no user
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('RepresentativeProtectedRoute - No user, redirecting to login');
      navigate('/representative/login');
    }
  }, [user, authLoading, navigate]);

  // If no user, don't render anything (redirect will happen)
  if (!user) {
    return null;
  }

  // If user exists but no representative data or error, show access denied
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

  console.log('RepresentativeProtectedRoute - Access granted');
  return <>{children}</>;
}