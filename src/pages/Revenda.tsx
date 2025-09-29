import { Helmet } from 'react-helmet-async';
import RevendaProtectedRoute from '@/components/auth/RevendaProtectedRoute';
import RevendaDashboard from '@/components/revenda/RevendaDashboard';

export default function Revenda() {
  return (
    <RevendaProtectedRoute>
      <Helmet>
        <title>Dashboard Revenda - AgroIkemba</title>
        <meta 
          name="description" 
          content="Dashboard executivo para revendas e cooperativas - gestão de produtos, análise de mercado e ofertas de compra."
        />
      </Helmet>
      
      <RevendaDashboard />
    </RevendaProtectedRoute>
  );
}