import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Bell, ChevronDown, GridIcon, List, Star, X, MapPin, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BannerCarousel from '@/components/ui/BannerCarousel';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useProductsWithInventory } from '@/hooks/useInventory';
import type { ProductWithInventory } from '@/types/inventory';

// Helper function to get category from active ingredient
const getProductCategory = (activeIngredient?: string): string => {
  if (!activeIngredient) return 'Outros';
  const ingredient = activeIngredient.toLowerCase();
  
  if (ingredient.includes('glifosato') || ingredient.includes('atrazina') || ingredient.includes('2,4-d')) {
    return 'Herbicidas';
  }
  if (ingredient.includes('mancozeb') || ingredient.includes('azoxistrobina') || ingredient.includes('tebuconazol')) {
    return 'Fungicidas';
  }
  if (ingredient.includes('clorpirifós') || ingredient.includes('imidacloprid') || ingredient.includes('lambda')) {
    return 'Inseticidas';
  }
  if (ingredient.includes('nitrogênio') || ingredient.includes('fósforo') || ingredient.includes('potássio') || ingredient.includes('npk')) {
    return 'Fertilizantes';
  }
  
  return 'Outros';
};

export default function ProductCatalogComponent() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: inventoryProducts = [], isLoading, error } = useProductsWithInventory();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersApplied, setFiltersApplied] = useState({
    manufacturers: [] as string[],
    inStock: false,
  });

  // Transform inventory data to display format
  const transformedProducts = useMemo(() => {
    return inventoryProducts.map((product) => ({
      id: product.sku,
      name: product.name,
      manufacturer: product.manufacturer,
      activeIngredient: product.active_ingredient || 'N/A',
      sku: product.sku,
      minPrice: Math.min(...product.price_tiers.map(tier => tier.price)),
      maxPrice: Math.max(...product.price_tiers.map(tier => tier.price)),
      priceTiers: product.price_tiers,
      totalVolume: product.total_volume,
      locations: product.locations,
      inStock: product.total_volume > 0,
      category: getProductCategory(product.active_ingredient),
      documents: product.documents,
      expiryDate: product.expiry_date,
      image: '/placeholder.svg' // Default image for now
    }));
  }, [inventoryProducts]);

  // Dynamic filter options from real data
  const availableManufacturers = useMemo(() => {
    const manufacturers = [...new Set(transformedProducts.map(p => p.manufacturer))];
    return manufacturers.sort();
  }, [transformedProducts]);

  const availableCategories = useMemo(() => {
    const categories = [...new Set(transformedProducts.map(p => p.category))];
    return categories.sort();
  }, [transformedProducts]);

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    let result = transformedProducts;
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by manufacturer
    if (filtersApplied.manufacturers.length > 0) {
      result = result.filter(product => filtersApplied.manufacturers.includes(product.manufacturer));
    }
    
    // Filter by stock
    if (filtersApplied.inStock) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.minPrice - b.minPrice);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.maxPrice - a.maxPrice);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'manufacturer':
        result = [...result].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
        break;
      case 'volume':
        result = [...result].sort((a, b) => b.totalVolume - a.totalVolume);
        break;
      // Default is relevance, no sorting needed
    }
    
    return result;
  }, [transformedProducts, searchTerm, selectedCategory, filtersApplied, sortBy]);

  // Toggle manufacturer filter
  const toggleManufacturer = (manufacturer: string) => {
    setFiltersApplied(prev => {
      const isSelected = prev.manufacturers.includes(manufacturer);
      return {
        ...prev,
        manufacturers: isSelected
          ? prev.manufacturers.filter(m => m !== manufacturer)
          : [...prev.manufacturers, manufacturer]
      };
    });
  };
  
  
  // Toggle in-stock filter
  const toggleInStock = () => {
    setFiltersApplied(prev => ({
      ...prev,
      inStock: !prev.inStock
    }));
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setFiltersApplied({
      manufacturers: [],
      inStock: false,
    });
    setSortBy('relevance');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <BannerCarousel />
          <div className="container-custom py-8">
            <Skeleton className="h-8 w-64 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-96">
                  <CardContent className="p-4">
                    <Skeleton className="h-48 w-full mb-4" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="container-custom py-8">
            <div className="text-center py-10">
              <p className="text-red-500 mb-4">Erro ao carregar produtos: {error.message}</p>
              <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        {/* Banner Carousel */}
        <BannerCarousel />
        
        {/* Search Bar Section */}
        <div className="bg-agro-green py-6">
          <div className="container-custom">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar produto, ingrediente ativo, cultura..."
                className="w-full h-12 pl-12 pr-4 rounded-md text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="container-custom py-8">
          <div className="flex flex-wrap mb-6 items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <h1 className="text-2xl font-bold">
                {selectedCategory || "Todos os Produtos"}
              </h1>
              <span className="text-muted-foreground">
                ({filteredProducts.length} produtos)
              </span>
            </div>

            <div className="flex gap-4 items-center">
              <Button 
                variant="outline" 
                className="flex items-center md:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtros
              </Button>
              
              <div className="flex items-center gap-2">
                <div className="hidden md:block">
                  <label htmlFor="sort-by" className="mr-2 text-sm">Ordenar por:</label>
                </div>
                <select 
                  id="sort-by"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="relevance">Relevância</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name">Nome (A-Z)</option>
                  <option value="manufacturer">Fabricante (A-Z)</option>
                  <option value="volume">Maior Volume</option>
                </select>
              </div>
              
              <div className="hidden md:flex border rounded-md">
                <button 
                  className={`p-2 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <GridIcon className="h-4 w-4" />
                </button>
                <button 
                  className={`p-2 ${viewMode === 'list' ? 'bg-muted' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar with filters */}
            {showFilters && (
              <aside className="w-full lg:w-64 flex-shrink-0 bg-white p-4 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-semibold text-lg">Filtros</h2>
                  <button onClick={clearFilters} className="text-sm text-agro-green hover:underline">
                    Limpar Filtros
                  </button>
                </div>
                
                {/* Categories */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Categorias</h3>
                  <div className="space-y-2">
                    {availableCategories.map((category) => (
                      <div key={category} className="flex items-center">
                        <button
                          onClick={() => setSelectedCategory(category === selectedCategory ? null : category)}
                          className={`w-full text-left py-1 px-2 rounded-md ${
                            category === selectedCategory ? 'bg-agro-green text-white' : 'hover:bg-muted'
                          }`}
                        >
                          {category}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t my-4"></div>
                
                {/* Manufacturers */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Fabricante</h3>
                  <div className="space-y-2">
                    {availableManufacturers.map((manufacturer) => (
                      <div key={manufacturer} className="flex items-center">
                        <Checkbox 
                          id={`manufacturer-${manufacturer}`}
                          checked={filtersApplied.manufacturers.includes(manufacturer)}
                          onCheckedChange={() => toggleManufacturer(manufacturer)}
                        />
                        <label 
                          htmlFor={`manufacturer-${manufacturer}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {manufacturer}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="border-t my-4"></div>
                
                {/* Stock availability */}
                <div className="mb-6">
                  <div className="flex items-center">
                    <Checkbox 
                      id="in-stock"
                      checked={filtersApplied.inStock}
                      onCheckedChange={toggleInStock}
                    />
                    <label 
                      htmlFor="in-stock"
                      className="ml-2 text-sm cursor-pointer"
                    >
                      Apenas produtos em estoque
                    </label>
                  </div>
                </div>
              </aside>
            )}

            {/* Product Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-muted-foreground">Nenhum produto encontrado. Tente ajustar seus filtros.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "flex flex-col gap-4"
                }>
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className={`${viewMode === 'list' ? "overflow-hidden" : ""} h-full flex flex-col`}>
                      <CardContent className={`p-0 ${viewMode === 'list' ? 'flex' : 'flex flex-col'} h-full`}>
                        <div className={`${viewMode === 'list' ? 'w-1/3' : 'w-full'}`}>
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className={`object-contain w-full ${viewMode === 'grid' ? 'h-48' : 'h-full'} p-4`}
                          />
                        </div>
                        
                        <div className={`p-4 ${viewMode === 'list' ? 'w-2/3' : 'flex-1'} flex flex-col`}>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-muted-foreground mb-1">{product.manufacturer}</p>
                            <p className="text-sm mb-2 line-clamp-1">
                              SKU: {product.sku} {product.activeIngredient && `• ${product.activeIngredient}`}
                            </p>
                            
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant={product.inStock ? "default" : "destructive"} className="text-xs">
                                {product.inStock ? 'Em estoque' : 'Indisponível'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {product.category}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                              <div className="flex items-center gap-1">
                                <Package className="h-3 w-3" />
                                {product.totalVolume.toLocaleString('pt-BR')} L
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {product.locations.length} {product.locations.length === 1 ? 'local' : 'locais'}
                              </div>
                            </div>

                            {product.locations.length > 0 && (
                              <div className="text-xs text-muted-foreground mb-2">
                                Disponível em: {product.locations.slice(0, 2).map(loc => `${loc.city}/${loc.state}`).join(', ')}
                                {product.locations.length > 2 && ` +${product.locations.length - 2} locais`}
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-auto">
                            <div className="mb-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium">Preço por litro:</span>
                                <span className="text-xs text-muted-foreground">Vol. mín: 1.000L</span>
                              </div>
                              
                              {product.minPrice === product.maxPrice ? (
                                <p className="text-xl font-bold text-agro-green">
                                  R$ {product.minPrice.toFixed(2).replace('.', ',')}
                                </p>
                              ) : (
                                <div>
                                  <p className="text-lg font-bold text-agro-green">
                                    R$ {product.minPrice.toFixed(2).replace('.', ',')} - R$ {product.maxPrice.toFixed(2).replace('.', ',')}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Preço varia conforme volume (min-max)
                                  </p>
                                </div>
                              )}
                              
                              <p className="text-xs text-muted-foreground mt-1">
                                Vencimento: {new Date(product.expiryDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  navigate(`/product/${product.sku}`);
                                }}
                              >
                                Ver Detalhes
                              </Button>
                              <Button 
                                variant="default" 
                                size="sm" 
                                className="flex-1"
                                onClick={() => {
                                  toast({
                                    title: "Produto adicionado",
                                    description: `${product.name} foi adicionado ao carrinho.`
                                  });
                                }}
                                disabled={!product.inStock}
                              >
                                <ShoppingCart className="mr-1 h-3 w-3" />
                                {product.inStock ? 'Comprar' : 'Indisponível'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}