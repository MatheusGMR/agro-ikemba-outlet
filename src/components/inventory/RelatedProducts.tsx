import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import type { GroupedProduct } from '@/types/inventory';

interface RelatedProductsProps {
  currentSku?: string;
  maxItems?: number;
}

export function RelatedProducts({ currentSku, maxItems = 4 }: RelatedProductsProps) {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useGroupedProductsForSales();

  // Filter out current product and limit results
  const relatedProducts = products
    .filter(product => product.sku !== currentSku && product.total_volume > 0)
    .slice(0, maxItems);

  if (isLoading || relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Outras Ofertas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <Card 
            key={product.sku}
            className="cursor-pointer group transition-all duration-300 hover:shadow-lg hover:scale-105 shadow-md border-0 bg-gradient-to-br from-white to-gray-50/80"
            onClick={() => navigate(`/products/${product.sku}`)}
          >
            <CardContent className="p-4">
              <div className="mb-3">
                <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                  <Package className="h-8 w-8 text-gray-400" />
                </div>
                
                <h4 className="font-semibold text-sm mb-1 line-clamp-2 text-primary group-hover:text-primary/80 transition-colors">
                  {product.active_ingredient || 'N/A'}
                </h4>
                <p className="text-xs text-muted-foreground mb-1 line-clamp-1">
                  {product.manufacturer}
                </p>
                <p className="text-xs text-muted-foreground mb-2">
                  SKU: {product.sku} • Técnico: {product.name}
                </p>
                
                <div className="flex items-center justify-between text-xs mb-2">
                  <Badge variant="default" className="text-xs">
                    Em estoque
                  </Badge>
                  <span className="text-muted-foreground">
                    {product.total_volume.toLocaleString()} L
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="text-lg font-bold text-primary">
                    R$ {product.main_item.base_price.toFixed(2)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    por litro
                  </div>
                </div>
              </div>
              
              <Button 
                size="sm" 
                className="w-full group-hover:bg-primary/90 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.sku}`);
                }}
              >
                <ShoppingCart className="mr-1 h-3 w-3" />
                Ver Produto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}