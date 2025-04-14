
import { Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ui/custom/ProductCard';

interface DashboardSidebarProps {
  products: Array<{
    id: string;
    name: string;
    manufacturer: string;
    category: string;
    rating: number;
    image: string;
    price: string;
  }>;
}

export function DashboardSidebar({ products }: DashboardSidebarProps) {
  return (
    <div className="space-y-8">
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
      
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recommended for You</h2>
        </div>
        
        <div className="space-y-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} className="border-0 shadow-none p-0" />
          ))}
        </div>
        
        <Button variant="ghost" size="sm" className="w-full mt-4">
          View All Products
        </Button>
      </Card>
    </div>
  );
}
