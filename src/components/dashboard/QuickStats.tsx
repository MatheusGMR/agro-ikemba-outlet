
import { TrendingUp, LayoutGrid, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';

export function QuickStats() {
  return (
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
  );
}
