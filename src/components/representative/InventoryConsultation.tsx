import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import { GroupedProductCard } from '@/components/inventory/GroupedProductCard';
import { ProductDistributionDialog } from '@/components/inventory/ProductDistributionDialog';
import type { GroupedProduct } from '@/types/inventory';

interface InventoryConsultationProps {
  children: React.ReactNode;
}

export default function InventoryConsultation({ children }: InventoryConsultationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<GroupedProduct | null>(null);
  const [distributionDialogOpen, setDistributionDialogOpen] = useState(false);
  
  const { data: products = [], isLoading } = useGroupedProductsForSales();

  // Filter products based on search criteria
  const filteredProducts = products.filter((product: GroupedProduct) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchLower) ||
      product.active_ingredient?.toLowerCase().includes(searchLower) ||
      product.manufacturer.toLowerCase().includes(searchLower);
    
    const matchesRegion = !selectedRegion || 
      product.all_items.some(item => 
        `${item.city}, ${item.state}`.toLowerCase().includes(selectedRegion.toLowerCase())
      );

    return matchesSearch && matchesRegion;
  });

  // Get unique regions for the filter
  const uniqueRegions = [
    ...new Set(
      products.flatMap(product => 
        product.all_items.map(item => `${item.city}, ${item.state}`)
      )
    )
  ].sort();

  const handleViewDistribution = (product: GroupedProduct) => {
    setSelectedProduct(product);
    setDistributionDialogOpen(true);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Consulta de Estoque
          </DialogTitle>
        </DialogHeader>

        {/* Search Filters */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Buscar Produto</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do produto, fabricante ou ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredProducts.length} produtos encontrados (somente preços unitários)</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('');
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((product: GroupedProduct) => (
                <GroupedProductCard
                  key={product.sku}
                  product={product}
                  onViewDistribution={handleViewDistribution}
                />
              ))}
            </div>
          )}
        </div>

        {/* Distribution Dialog */}
        <ProductDistributionDialog
          product={selectedProduct}
          open={distributionDialogOpen}
          onOpenChange={setDistributionDialogOpen}
        />
      </DialogContent>
    </Dialog>
  );
}