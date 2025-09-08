import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ui/custom/ProductCard';
import type { Product } from '@/types/dashboard';
interface RecommendedProductsProps {
  products: Product[];
}
export function RecommendedProducts({
  products
}: RecommendedProductsProps) {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Produtos Recomendados</h2>
      
      <div className="space-y-4">
        {products.slice(0, 3).map((product) => (
          <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border">
            <img 
              src={product.image} 
              alt={product.name}
              className="w-12 h-12 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{product.name}</p>
              <p className="text-xs text-muted-foreground">{product.manufacturer}</p>
              <p className="text-sm font-semibold text-primary">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Button variant="ghost" size="sm" className="w-full mt-4">
        Ver Todos
      </Button>
    </Card>
  );
}