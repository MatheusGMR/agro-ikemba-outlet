import { useUserApproval } from '@/hooks/useUserApproval';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from './alert';
import { Badge } from './badge';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function ApprovalBanner() {
  const { user } = useAuth();
  const { isApproved, isPending, isLoading } = useUserApproval();

  if (!user || isLoading) return null;

  if (isApproved) {
    return (
      <Alert className="border-green-200 bg-green-50 text-green-800 mb-4">
        <CheckCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Sua conta está aprovada! Você tem acesso completo aos preços e pode realizar compras.</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Conta Aprovada
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50 text-yellow-800 mb-4">
        <Clock className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Sua conta está em análise. Os preços serão liberados após a aprovação da nossa equipe.</span>
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Aprovação Pendente
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-red-200 bg-red-50 text-red-800 mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Para ver os preços e realizar compras, é necessário completar seu cadastro e aguardar aprovação.</span>
        <Badge variant="secondary" className="bg-red-100 text-red-800">
          Cadastro Incompleto
        </Badge>
      </AlertDescription>
    </Alert>
  );
}