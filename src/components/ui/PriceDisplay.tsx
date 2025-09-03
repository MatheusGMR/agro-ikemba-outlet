import { useUserApproval } from '@/hooks/useUserApproval';
import { useAuth } from '@/hooks/useAuth';
import { Button } from './button';
import { Badge } from './badge';
import { Lock, Eye } from 'lucide-react';

interface PriceDisplayProps {
  price: string | number;
  className?: string;
  showUnit?: boolean;
  unit?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function PriceDisplay({ 
  price, 
  className = '', 
  showUnit = true, 
  unit = '/L',
  size = 'md' 
}: PriceDisplayProps) {
  const { user } = useAuth();
  const { isApproved, isPending } = useUserApproval();

  // If user is not logged in, show masked price
  if (!user) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`font-bold text-muted-foreground ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-base'}`}>
          •••••
        </span>
        <Badge variant="outline" className="gap-1">
          <Lock className="w-3 h-3" />
          Login necessário
        </Badge>
      </div>
    );
  }

  // If user is pending approval, show request quote
  if (isPending) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className={`font-bold text-muted-foreground ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-base'}`}>
          •••••
        </span>
        <Badge variant="secondary" className="gap-1">
          <Eye className="w-3 h-3" />
          Aprovação pendente
        </Badge>
      </div>
    );
  }

  // If user is approved, show real price
  if (isApproved) {
    const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;
    return (
      <span className={`font-bold text-primary ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-base'} ${className}`}>
        R$ {formattedPrice}
        {showUnit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
      </span>
    );
  }

  // Default fallback for other states
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className={`font-bold text-muted-foreground ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-base'}`}>
        •••••
      </span>
      <Badge variant="outline" className="gap-1">
        <Lock className="w-3 h-3" />
        Acesso restrito
      </Badge>
    </div>
  );
}