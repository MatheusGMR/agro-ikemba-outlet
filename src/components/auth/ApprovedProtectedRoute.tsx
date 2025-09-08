import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserApproval } from '@/hooks/useUserApproval';

interface ApprovedProtectedRouteProps {
  children: ReactNode;
}

export default function ApprovedProtectedRoute({ children }: ApprovedProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isApproved, isPending, isLoading: approvalLoading } = useUserApproval();
  const location = useLocation();

  console.log('🛡️ ApprovedProtectedRoute: State check', {
    userEmail: user?.email,
    authLoading,
    approvalLoading,
    isApproved,
    isPending,
    pathname: location.pathname
  });

  // Save current location for redirect after login
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [user, location]);

  if (authLoading || approvalLoading) {
    console.log('⏳ ApprovedProtectedRoute: Still loading, showing spinner');
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // For checkout page specifically, require authentication
  if (location.pathname === '/checkout' && !user) {
    console.log('🔒 ApprovedProtectedRoute: Checkout requires auth, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Allow unauthenticated users to reach the page so AuthGate can handle login/registration
  if (!user) {
    console.log('👤 ApprovedProtectedRoute: No user, allowing access for AuthGate');
    return <>{children}</>;
  }

  // CRITICAL FIX: Only redirect if we're certain the user is not approved
  // Don't redirect during loading states or if approval status is unclear
  if (user && !approvalLoading && !authLoading) {
    if (isApproved) {
      console.log('✅ ApprovedProtectedRoute: User is approved, allowing access');
      return <>{children}</>;
    } else if (isPending || (!isApproved && !isPending)) {
      console.log('🚫 ApprovedProtectedRoute: User not approved, redirecting to pending approval');
      return <Navigate to="/pending-approval" replace />;
    }
  }

  // Fallback: if we reach here, something is unclear, show loading
  console.log('❓ ApprovedProtectedRoute: Unclear state, showing loading');
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-muted-foreground">Verificando permissões...</p>
      </div>
    </div>
  );
}
