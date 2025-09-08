
import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { useUserOrders } from '@/hooks/useUserOrders';
import { useAuth } from '@/hooks/useAuth';
import { LoadingFallback } from '@/components/ui/LoadingFallback';
import type { Product } from '@/types/dashboard';

export default function Dashboard() {
  const [userType] = useState<'manufacturer' | 'distributor'>('distributor');
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: orders = [], isLoading: isLoadingOrders } = useUserOrders(5);

  if (isAuthLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso Restrito</h2>
          <p className="text-gray-600">Você precisa fazer login para ver seus pedidos.</p>
        </div>
      </div>
    );
  }
  
  const productSamples: Product[] = [
    {
      id: 'p1',
      name: 'Ultra Nitrogen Fertilizer 20-0-0',
      manufacturer: 'AgroMax Industries',
      category: 'Fertilizer',
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1592978132926-646f366c3a2a?q=80&w=600&auto=format&fit=crop',
      price: 'R$124,50/ton'
    },
    {
      id: 'p2',
      name: 'Broad-Spectrum Herbicide Formula',
      manufacturer: 'GreenProtect Solutions',
      category: 'Herbicide',
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?q=80&w=600&auto=format&fit=crop',
      price: 'R$89,75/L'
    },
    {
      id: 'p3',
      name: 'Premium Organic Growth Enhancer',
      manufacturer: 'Nature+',
      category: 'Growth Enhancer',
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1589928058953-fc826d1eb641?q=80&w=600&auto=format&fit=crop',
      price: 'R$76,20/kg'
    }
  ];
  
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader userType={userType} />
      
      <div className="container-custom py-8">
        <DashboardActions userType={userType} />
        <QuickStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <RecentOrders orders={orders} isLoading={isLoadingOrders} />
          </div>
          
          <DashboardSidebar products={productSamples} />
        </div>
      </div>
    </div>
  );
}
