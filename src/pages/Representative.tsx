import { Helmet } from 'react-helmet-async';
import ProgressiveLoadingDashboard from '@/components/representative/ProgressiveLoadingDashboard';

export default function Representative() {
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
        <div className="container mx-auto p-6">
          <ProgressiveLoadingDashboard />
        </div>
      </div>
    </>
  );
}