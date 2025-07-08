
import { useEffect } from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/auth/AdminLogin';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkAuthStatus } = useAdminAuth();

  useEffect(() => {
    console.log('AdminProtectedRoute montado');
    console.log('Estado atual:', { isAuthenticated, isLoading });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  console.log('AdminProtectedRoute render:', { isAuthenticated, isLoading });

  if (isLoading) {
    console.log('Mostrando loading...');
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    console.log('Não autenticado, mostrando login...');
    return <AdminLogin />;
  }

  console.log('Autenticado, mostrando conteúdo protegido...');
  return <>{children}</>;
}
