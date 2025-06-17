
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminLogin from '@/components/auth/AdminLogin';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  return <>{children}</>;
}
