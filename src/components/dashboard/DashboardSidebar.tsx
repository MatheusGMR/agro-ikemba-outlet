
import type { Product } from '@/types/dashboard';
import { UpcomingEvents } from './UpcomingEvents';
import { RecommendedProducts } from './RecommendedProducts';

interface DashboardSidebarProps {
  products: Product[];
}

export function DashboardSidebar({ products }: DashboardSidebarProps) {
  return (
    <div className="space-y-8">
      <UpcomingEvents />
      <RecommendedProducts products={products} />
    </div>
  );
}
