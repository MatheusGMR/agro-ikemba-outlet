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
  // Always show real prices - no more login walls!
  const formattedPrice = typeof price === 'number' ? price.toFixed(2) : price;
  
  return (
    <span className={`font-bold text-primary ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-lg' : 'text-base'} ${className}`}>
      R$ {formattedPrice}
      {showUnit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
    </span>
  );
}