import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import RuralClientManagementPanel from '@/components/representative/RuralClientManagementPanel';
import { LoadingFallback } from '@/components/ui/LoadingFallback';

export default function RuralManagement() {
  const { data: representative, isLoading, error } = useCurrentRepresentative();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !representative) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-destructive mb-2">
            Acesso Negado
          </h2>
          <p className="text-muted-foreground">
            Esta área é exclusiva para representantes autorizados.
          </p>
        </div>
      </div>
    );
  }

  return <RuralClientManagementPanel representativeId={representative.id} />;
}