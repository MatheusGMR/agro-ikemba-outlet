import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserApproval } from '@/hooks/useUserApproval';

interface ApprovedProtectedRouteProps {
  children: ReactNode;
}

export default function ApprovedProtectedRoute({ children }: ApprovedProtectedRouteProps) {
  const { user, isLoading: authLoading } = useAuth();
  const { isApproved, isLoading: approvalLoading } = useUserApproval();
  const location = useLocation();

  // Save current location for redirect after login
  useEffect(() => {
    if (!user && location.pathname !== '/login') {
      localStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    }
  }, [user, location]);

  if (authLoading || approvalLoading) {
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
    return <Navigate to="/login" replace />;
  }

  // Allow unauthenticated users to reach the page so AuthGate can handle login/registration
  if (!user) {
    return <>{children}</>;
  }

  // If user is authenticated but not approved, redirect to pending approval
  if (!isApproved) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}
