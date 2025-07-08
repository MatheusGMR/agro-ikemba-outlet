import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Bell, ChevronDown, GridIcon, List, Star, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BannerCarousel from '@/components/ui/BannerCarousel';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

// Mock data for products
const MOCK_PRODUCTS = [
  {
    id: 1,
    name: 'Glifosato Premium 480',
    manufacturer: 'AgroTech',
    activeIngredient: 'Glifosato',
    concentration: '480 g/L',
    formulation: 'SL',
    price: 85.90,
    unit: 'Galão 20L',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Herbicidas'
  },
  {
    id: 2,
    name: 'Mancozeb Plus',
    manufacturer: 'FarmChem',
    activeIngredient: 'Mancozeb',
    concentration: '800 g/kg',
    formulation: 'WP',
    price: 45.50,
    unit: 'Saco 25kg',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Fungicidas'
  },
  {
    id: 3,
    name: 'Clorpirifós Gold',
    manufacturer: 'BestCrop',
    activeIngredient: 'Clorpirifós',
    concentration: '480 g/L',
    formulation: 'EC',
    price: 120.00,
    unit: 'Galão 5L',
    image: '/placeholder.svg',
    inStock: false,
    category: 'Inseticidas'
  },
  {
    id: 4,
    name: 'NPK Supreme 20-05-20',
    manufacturer: 'NutriSoil',
    activeIngredient: 'N-P-K',
    concentration: '20-05-20',
    formulation: 'GR',
    price: 130.75,
    unit: 'Saco 50kg',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Fertilizantes'
  },
  {
    id: 5,
    name: 'Atrazina Max',
    manufacturer: 'AgroTech',
    activeIngredient: 'Atrazina',
    concentration: '500 g/L',
    formulation: 'SC',
    price: 68.20,
    unit: 'Galão 20L',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Herbicidas'
  },
  {
    id: 6,
    name: 'Azoxistrobina Plus',
    manufacturer: 'FarmChem',
    activeIngredient: 'Azoxistrobina',
    concentration: '250 g/L',
    formulation: 'SC',
    price: 210.90,
    unit: 'Galão 5L',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Fungicidas'
  },
  {
    id: 7,
    name: 'Imidacloprid Power',
    manufacturer: 'BestCrop',
    activeIngredient: 'Imidacloprid',
    concentration: '700 g/kg',
    formulation: 'WG',
    price: 188.30,
    unit: 'Embalagem 1kg',
    image: '/placeholder.svg',
    inStock: true,
    category: 'Inseticidas'
  },
  {
    id: 8,
    name: 'Uréia Premium',
    manufacturer: 'NutriSoil',
    activeIngredient: 'Nitrogênio',
    concentration: '46-00-00',
    formulation: 'GR',
    price: 145.00,
    unit: 'Saco 50kg',
    image: '/placeholder.svg',
    inStock: false,
    category: 'Fertilizantes'
  }
];

// Categories for filters
const CATEGORIES = [
  'Herbicidas',
  'Fungicidas',
  'Inseticidas',
  'Fertilizantes',
  'Adjuvantes'
];

// Manufacturers for filters
const MANUFACTURERS = [
  'AgroTech',
  'FarmChem',
  'BestCrop',
  'NutriSoil'
];

// Formulations for filters
const FORMULATIONS = [
  'SL', 'SC', 'EC', 'WP', 'WG', 'GR'
];

const ProductCatalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState(MOCK_PRODUCTS);
  const [sortBy, setSortBy] = useState('relevance');
  const [filtersApplied, setFiltersApplied] = useState({
    manufacturers: [] as string[],
    formulations: [] as string[],
    inStock: false,
  });

  // Check user permissions on component mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar o catálogo de produtos.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    if (!user.verified) {
      toast({
        title: "Acesso pendente",
        description: "Seu acesso ainda não foi aprovado pelo administrador. Você será redirecionado para a página inicial.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [navigate, toast]);

  // Apply filters and search
  useEffect(() => {
    let result = MOCK_PRODUCTS;
    
    // Apply search term
    if (searchTerm) {
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.activeIngredient.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
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
    
    // Filter by formulation
    if (filtersApplied.formulations.length > 0) {
      result = result.filter(product => filtersApplied.formulations.includes(product.formulation));
    }
    
    // Filter by stock
    if (filtersApplied.inStock) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply sorting
    switch(sortBy) {
      case 'price-asc':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'manufacturer':
        result = [...result].sort((a, b) => a.manufacturer.localeCompare(b.manufacturer));
        break;
      // Default is relevance, no sorting needed
    }
    
    setFilteredProducts(result);
  }, [searchTerm, selectedCategory, filtersApplied, sortBy]);

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
  
  // Toggle formulation filter
  const toggleFormulation = (formulation: string) => {
    setFiltersApplied(prev => {
      const isSelected = prev.formulations.includes(formulation);
      return {
        ...prev,
        formulations: isSelected
          ? prev.formulations.filter(f => f !== formulation)
          : [...prev.formulations, formulation]
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
      formulations: [],
      inStock: false,
    });
    setSortBy('relevance');
  };

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Don't render the page content if user is not verified
  if (!user || !user.verified) {
    return null;
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
                    {CATEGORIES.map((category) => (
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
                    {MANUFACTURERS.map((manufacturer) => (
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
                
                {/* Formulations */}
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Formulação</h3>
                  <div className="space-y-2">
                    {FORMULATIONS.map((formulation) => (
                      <div key={formulation} className="flex items-center">
                        <Checkbox 
                          id={`formulation-${formulation}`}
                          checked={filtersApplied.formulations.includes(formulation)}
                          onCheckedChange={() => toggleFormulation(formulation)}
                        />
                        <label 
                          htmlFor={`formulation-${formulation}`}
                          className="ml-2 text-sm cursor-pointer"
                        >
                          {formulation}
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
                              {product.activeIngredient} - {product.concentration} - {product.formulation}
                            </p>
                            
                            <div className="flex items-center mb-2">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                product.inStock 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {product.inStock ? 'Em estoque' : 'Sob consulta'}
                              </span>
                            </div>
                            
                            <div className="mb-3">
                              <p className="text-sm">{product.unit}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-end justify-between mt-auto pt-2">
                            <div className="flex-1">
                              {product.inStock ? (
                                <>
                                  <p className="text-lg font-bold">
                                    R$ {product.price.toFixed(2)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">por unidade</p>
                                </>
                              ) : (
                                <Button variant="outline" size="sm" className="mb-2">
                                  Solicitar Cotação
                                </Button>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-2">
                              <Button size="sm" variant="outline" className="p-2">
                                <Star className="h-4 w-4" />
                              </Button>
                              
                              <Button asChild size="sm" className="whitespace-nowrap">
                                <Link to={`/product/${product.id}`}>Detalhes</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
              
              {/* Pagination */}
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious href="#" />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink isActive href="#">1</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">2</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink href="#">3</PaginationLink>
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext href="#" />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductCatalog;
