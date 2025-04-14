
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Order {
  id: string;
  product: string;
  date: string;
  status: 'pending' | 'processing' | 'delivered';
  amount: string;
}

interface RecentOrdersProps {
  orders: Order[];
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
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
  );
}
