import { useState } from 'react';
import { BarChart, User, ShoppingCart, Package, Calendar, ChevronRight, TrendingUp, LayoutGrid, Clock, Star } from 'lucide-react';
import StatCard from '@/components/ui/custom/StatCard';
import ProductCard from '@/components/ui/custom/ProductCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Order {
  id: string;
  product: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered';
  amount: string;
}

export default function Dashboard() {
  const [userType] = useState<'manufacturer' | 'distributor'>('distributor');
  
  const orders: Order[] = [
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
  
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container-custom h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-agro-green flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-poppins font-bold text-xl">
              <span className="text-agro-green">Agro</span>
              <span className="text-agro-earth">Ikemba</span>
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-agro-green-light flex items-center justify-center text-white">
                JD
              </div>
              <span className="font-medium">John Doe</span>
            </div>
          </div>
        </div>
      </header>
      
      <div className="container-custom py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-agro-green-dark">
            {userType === 'manufacturer' ? 'Manufacturer Dashboard' : 'Distributor Dashboard'}
          </h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Export Data</Button>
            <Button size="sm" className="bg-agro-green hover:bg-agro-green-light">
              {userType === 'manufacturer' ? 'Add Product' : 'New Order'}
            </Button>
          </div>
        </div>
        
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
            {/* Recent Orders */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Orders</h2>
                <Button variant="ghost" size="sm" className="text-agro-green">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b border-gray-200">
                      <th className="pb-3 font-medium text-gray-500">Order ID</th>
                      <th className="pb-3 font-medium text-gray-500">Product</th>
                      <th className="pb-3 font-medium text-gray-500">Date</th>
                      <th className="pb-3 font-medium text-gray-500">Status</th>
                      <th className="pb-3 font-medium text-gray-500 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-4 font-medium text-agro-green">{order.id}</td>
                        <td className="py-4">{order.product}</td>
                        <td className="py-4 text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 text-right font-medium">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
            
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Monthly Growth</p>
                  <p className="text-xl font-semibold">+15%</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <LayoutGrid className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Categories</p>
                  <p className="text-xl font-semibold">8 Active</p>
                </div>
              </Card>
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-full">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg. Response</p>
                  <p className="text-xl font-semibold">2.4 hours</p>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Sidebar Column */}
          <div className="space-y-8">
            {/* Calendar Card */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-agro-green" />
                <h2 className="text-lg font-semibold">Upcoming</h2>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-agro-green pl-3">
                  <p className="text-sm text-gray-600">April 12, 2025</p>
                  <p className="font-medium">Fertilizer Shipment Arrival</p>
                </div>
                <div className="border-l-4 border-agro-green-light pl-3">
                  <p className="text-sm text-gray-600">April 15, 2025</p>
                  <p className="font-medium">Quarterly Review Meeting</p>
                </div>
                <div className="border-l-4 border-agro-earth pl-3">
                  <p className="text-sm text-gray-600">April 18, 2025</p>
                  <p className="font-medium">New Product Listing Deadline</p>
                </div>
              </div>
              
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View Calendar
              </Button>
            </Card>
            
            {/* Recommended Products */}
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {userType === 'manufacturer' ? 'Top Performing Products' : 'Recommended for You'}
                </h2>
              </div>
              
              <div className="space-y-4">
                {productSamples.map((product, index) => (
                  <div key={index} className="flex gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-medium line-clamp-1">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.manufacturer}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-3 h-3 text-agro-gold fill-agro-gold" />
                        <span className="text-xs">{product.rating}</span>
                        <span className="text-xs font-medium text-agro-green ml-2">{product.price}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button variant="ghost" size="sm" className="w-full mt-4">
                View All Products
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Bell(props: any) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}
