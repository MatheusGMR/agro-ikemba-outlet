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

  if (!user || !isApproved) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
