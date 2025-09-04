import { Package } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  if (!src) {
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
        className="w-full h-full object-cover transition-transform duration-200 hover:scale-105"
        loading="lazy"
        onError={(e) => {
          // Se a imagem falhar ao carregar, mostrar o fallback
          const target = e.target as HTMLImageElement;
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = `
              <div class="flex items-center justify-center bg-muted/30 border border-muted rounded-lg w-full h-full">
                <svg class="w-12 h-12 text-muted-foreground/60" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
            `;
          }
        }}
      />
    </div>
  );
}