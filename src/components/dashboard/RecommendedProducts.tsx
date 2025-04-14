
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ProductCard from '@/components/ui/custom/ProductCard';
import type { Product } from '@/types/dashboard';

interface RecommendedProductsProps {
  products: Product[];
}

export function RecommendedProducts({ products }: RecommendedProductsProps) {
  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Recommended for You</h2>
      </div>
      
      <div className="space-y-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} className="border-0 shadow-none p-0" />
        ))}
      </div>
      
      <Button variant="ghost" size="sm" className="w-full mt-4">
        View All Products
      </Button>
    </Card>
  );
}
