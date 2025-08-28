import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import RepDashboard from '@/components/representative/RepDashboard';
import { useCurrentRepresentative } from '@/hooks/useRepresentative';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import { supabase } from '@/integrations/supabase/client';

export default function Representative() {
  const navigate = useNavigate();
  const { data: representative, isLoading, error } = useCurrentRepresentative();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (error || !representative) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-4">
            Você não tem permissão para acessar o painel de representante.
          </p>
          <p className="text-sm text-muted-foreground">
            Entre em contato com o administrador para obter acesso.
          </p>
        </div>
      </div>
    );
  }

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
          <RepDashboard />
        </div>
      </div>
    </>
  );
}