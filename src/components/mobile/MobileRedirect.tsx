import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

/**
 * Componente dedicado para redirecionamento em plataforma mobile
 * Não executa analytics nem logs pesados, apenas auth + redirect
 */
export const MobileRedirect = () => {
  console.log('[MobileRedirect] Component mounted on native platform');
  
  const navigate = useNavigate();
  const { user, isRepresentative, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('[MobileRedirect] useEffect triggered:', { isLoading, user: !!user, isRepresentative });
    
    if (!isLoading) {
      console.log('[MobileRedirect] Auth loaded:', { user: !!user, isRepresentative });

      if (user && isRepresentative) {
        console.log('[MobileRedirect] Redirecting to /representative');
        navigate('/representative', { replace: true });
      } else if (user) {
        console.log('[MobileRedirect] Redirecting to /products');
        navigate('/products', { replace: true });
      } else {
        console.log('[MobileRedirect] Redirecting to /representative/login');
        navigate('/representative/login', { replace: true });
      }
    }
  }, [user, isRepresentative, isLoading, navigate]);
  
  return <LoadingFallback />;
};
