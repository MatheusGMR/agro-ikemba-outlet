import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Package, MapPin, Beaker } from 'lucide-react';
import { useAllInventory } from '@/hooks/useInventory';
import { formatCurrency } from '@/lib/utils';
import type { InventoryItem } from '@/types/inventory';

interface InventoryConsultationProps {
  children: React.ReactNode;
}

export default function InventoryConsultation({ children }: InventoryConsultationProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const { data: inventory = [], isLoading } = useAllInventory();

  // Filter inventory based on search criteria
  const filteredInventory = inventory.filter((item: InventoryItem) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      item.product_name.toLowerCase().includes(searchLower) ||
      item.active_ingredient?.toLowerCase().includes(searchLower);
    
    const matchesRegion = !selectedRegion || 
      item.state.toLowerCase().includes(selectedRegion.toLowerCase()) ||
      item.city.toLowerCase().includes(selectedRegion.toLowerCase());

    return matchesSearch && matchesRegion;
  });

  // Get unique regions for the filter
  const uniqueRegions = [...new Set(inventory.map(item => `${item.city}, ${item.state}`))].sort();

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Produto ou Ativo</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Digite o nome do produto ou ativo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Região</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Todas as regiões</option>
                  {uniqueRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{filteredInventory.length} produtos encontrados</span>
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
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded" />
                      <div className="h-3 bg-muted rounded w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum produto encontrado com os filtros aplicados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredInventory.map((item: InventoryItem) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{item.product_name}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Beaker className="h-4 w-4" />
                      {item.active_ingredient || 'N/A'}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Location and Volume */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{item.city}, {item.state}</span>
                      </div>
                      <Badge variant="secondary">
                        {item.volume_available.toLocaleString()} {item.unit}
                      </Badge>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Preço Cliente:</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(item.client_price)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Tier:</span>
                        <Badge variant="outline">{item.price_tier}</Badge>
                      </div>

                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Comissão/Un:</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(item.commission_unit)}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="pt-2 border-t text-xs text-muted-foreground space-y-1">
                      <div>Fabricante: {item.manufacturer}</div>
                      <div>SKU: {item.product_sku}</div>
                      <div>Embalagem: {item.packaging}</div>
                      {item.expiry_date && (
                        <div>Validade: {new Date(item.expiry_date).toLocaleDateString('pt-BR')}</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}