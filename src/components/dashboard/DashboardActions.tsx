
import { Button } from '@/components/ui/button';

interface DashboardActionsProps {
  userType: 'manufacturer' | 'distributor';
}

export function DashboardActions({ userType }: DashboardActionsProps) {
  return (
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
  );
}
