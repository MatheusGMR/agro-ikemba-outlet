import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { UserOrder } from '@/hooks/useUserOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '@/constants/orderStatus';

interface RecentOrdersProps {
  orders: UserOrder[];
  isLoading?: boolean;
}

export function RecentOrders({ orders, isLoading }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    return ORDER_STATUS_COLORS[status as OrderStatus] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status: string) => {
    return ORDER_STATUS_LABELS[status as OrderStatus] || status;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getProductNames = (items: any) => {
    if (!items || !Array.isArray(items)) return 'Produtos diversos';
    
    const productNames = items.map(item => item.product_name || item.name).filter(Boolean);
    if (productNames.length === 0) return 'Produtos diversos';
    if (productNames.length === 1) return productNames[0];
    if (productNames.length === 2) return productNames.join(' e ');
    return `${productNames[0]} e mais ${productNames.length - 1} item${productNames.length > 2 ? 's' : ''}`;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Carregando pedidos...</div>
        </div>
      </Card>
    );
  }

  if (orders.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">Nenhum pedido encontrado</div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pedidos Recentes</h2>
        <Button variant="ghost" size="sm" className="text-agro-green">
          Ver Todos <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200">
              <th className="pb-3 font-medium text-gray-500">Nº Pedido</th>
              <th className="pb-3 font-medium text-gray-500">Produtos</th>
              <th className="pb-3 font-medium text-gray-500">Data</th>
              <th className="pb-3 font-medium text-gray-500">Status</th>
              <th className="pb-3 font-medium text-gray-500 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 font-medium text-agro-green">{order.order_number}</td>
                <td className="py-4">{getProductNames(order.items)}</td>
                <td className="py-4 text-gray-600">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="py-4 text-right font-medium">{formatCurrency(order.total_amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
