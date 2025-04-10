
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export default function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-lg border border-gray-100 shadow-sm", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          
          {trend && (
            <div className="flex items-center mt-1">
              <span className={`text-xs font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs. last month</span>
            </div>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        {icon && (
          <div className="p-2 bg-agro-green/10 rounded-full">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
