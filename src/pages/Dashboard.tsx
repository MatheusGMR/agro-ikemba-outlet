import { useState } from 'react';
import { BarChart, User, ShoppingCart, Package } from 'lucide-react';
import StatCard from '@/components/ui/custom/StatCard';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardActions } from '@/components/dashboard/DashboardActions';
import { RecentOrders } from '@/components/dashboard/RecentOrders';
import { QuickStats } from '@/components/dashboard/QuickStats';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';

export default function Dashboard() {
  const [userType] = useState<'manufacturer' | 'distributor'>('distributor');
  
  const orders = [
    { id: 'ORD-7829', product: 'Generic Herbicide Plus', date: '2025-04-08', status: 'pending', amount: 'R$25,400' },
    { id: 'ORD-7823', product: 'Organic Fertilizer X-90', date: '2025-04-05', status: 'processing', amount: 'R$12,750' },
    { id: 'ORD-7814', product: 'Insect Control Pro', date: '2025-04-02', status: 'delivered', amount: 'R$8,920' },
    { id: 'ORD-7809', product: 'Soil Enhancer Mix', date: '2025-03-28', status: 'delivered', amount: 'R$6,300' },
  ];
  
  const productSamples = [
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
        
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title={userType === 'manufacturer' ? 'Total Sales' : 'Total Purchases'}
            value="R$253,890"
            trend={{ value: 12, isPositive: true }}
            icon={<BarChart className="w-5 h-5 text-agro-green" />}
          />
          <StatCard 
            title={userType === 'manufacturer' ? 'Active Products' : 'Products Purchased'}
            value="37"
            trend={{ value: 5, isPositive: true }}
            icon={<Package className="w-5 h-5 text-agro-green" />}
          />
          <StatCard 
            title="Active Orders"
            value="12"
            trend={{ value: 2, isPositive: false }}
            icon={<ShoppingCart className="w-5 h-5 text-agro-green" />}
          />
          <StatCard 
            title={userType === 'manufacturer' ? 'Connected Distributors' : 'Connected Manufacturers'}
            value="24"
            trend={{ value: 8, isPositive: true }}
            icon={<User className="w-5 h-5 text-agro-green" />}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            <RecentOrders orders={orders} />
            <QuickStats />
          </div>
          
          {/* Sidebar Column */}
          <DashboardSidebar products={productSamples} />
        </div>
      </div>
    </div>
  );
}
