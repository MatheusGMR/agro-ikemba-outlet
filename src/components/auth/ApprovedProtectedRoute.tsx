import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserApproval } from '@/hooks/useUserApproval';

interface ApprovedProtectedRouteProps {
  children: ReactNode;
}

export default function ApprovedProtectedRoute({ children }: ApprovedProtectedRouteProps) {
  const { user } = useAuth();
  const { isApproved, isLoading } = useUserApproval();

  if (isLoading) return null;

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
