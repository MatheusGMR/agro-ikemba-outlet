import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ProductImageProps {
  src?: string | null;
  alt?: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProductImage({ 
  src, 
  alt = 'Produto', 
  className = '',
  fallbackClassName = ''
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Show fallback if no src, src is null, or image failed to load
  const showFallback = !src || hasError;

  if (showFallback) {
    return (
      <div className={cn(
        'flex items-center justify-center bg-muted/30 border border-muted rounded-lg',
        fallbackClassName,
        className
      )}>
        <Package className="w-12 h-12 text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <img 
        src={src} 
        alt={alt}
        className={cn(
          'w-full h-full object-cover transition-transform duration-200 hover:scale-105',
          isLoading && 'opacity-0'
        )}
        loading="lazy"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      
      {/* Loading placeholder */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 border border-muted rounded-lg">
          <Package className="w-12 h-12 text-muted-foreground/60 animate-pulse" />
        </div>
      )}
    </div>
  );
}