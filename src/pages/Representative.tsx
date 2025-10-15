import { Helmet } from 'react-helmet-async';
import RepresentativeHeader from '@/components/representative/RepresentativeHeader';
import ProgressiveLoadingDashboard from '@/components/representative/ProgressiveLoadingDashboard';
import { SessionTimeoutModal } from '@/components/representative/SessionTimeoutModal';
import { OfflineIndicator } from '@/components/mobile/OfflineIndicator';
import { useSessionTimeout } from '@/hooks/useSessionTimeout';

export default function Representative() {
  const { isWarningOpen, timeRemaining, extendSession, closeWarning } = useSessionTimeout();

  return (
    <>
      <Helmet>
        <title>Painel do Representante - AgroIkemba</title>
        <meta 
          name="description" 
          content="Gerencie suas vendas, clientes e comissões no painel do representante AgroIkemba. Acompanhe seu pipeline de vendas e maximize seus resultados."
        />
      </Helmet>

      <div className="min-h-screen bg-background">
        <RepresentativeHeader />
        <OfflineIndicator />
        <div className="container mx-auto p-6">
          <ProgressiveLoadingDashboard />
        </div>
        
        <SessionTimeoutModal
          isOpen={isWarningOpen}
          timeRemaining={timeRemaining}
          onExtendSession={extendSession}
          onClose={closeWarning}
        />
      </div>
    </>
  );
}