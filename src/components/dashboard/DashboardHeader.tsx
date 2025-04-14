
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

interface DashboardHeaderProps {
  userType: 'manufacturer' | 'distributor';
}

export function DashboardHeader({ userType }: DashboardHeaderProps) {
  return (
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
  );
}
