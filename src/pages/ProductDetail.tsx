import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronRight, Download, Heart, ShoppingCart, Star, Truck, Info, Plus, Minus, MapPin, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { useInventoryBySku, useProductDocuments } from '@/hooks/useInventory';
import DynamicPriceCard from '@/components/inventory/DynamicPriceCard';
import { InventoryService } from '@/services/inventoryService';
import { analyticsService } from '@/services/analyticsService';

// Mock product data
const PRODUCT = {
  id: 1,
  name: 'Glifosato Premium 480',
  manufacturer: 'AgroTech',
  activeIngredient: 'Glifosato',
  concentration: '480 g/L',
  formulation: 'SL (Concentrado Solúvel)',
  registerNumber: '12345-MAPA',
  description: 'Herbicida sistêmico, não seletivo, de amplo espectro, à base de glifosato, eficaz no controle de plantas daninhas anuais e perenes em diversas culturas. Formulação premium que oferece rápida absorção e alta eficiência no controle.',
  inStock: true,
  mainImage: '/placeholder.svg',
  additionalImages: ['/placeholder.svg', '/placeholder.svg', '/placeholder.svg'],
  packaging: [
    { size: '5L', price: 23.90, stock: 200 },
    { size: '20L', price: 85.90, stock: 150 },
    { size: '1000L', price: 4150.00, stock: 10 }
  ],
  technicalInfo: {
    composition: 'Glifosato - 480 g/L (48% m/v), Ingredientes inertes - 640 g/L (64% m/v)',
    density: '1,17 g/cm³',
    pH: '4,5 - 5,0',
    toxicClass: 'III - Medianamente tóxico',
    environmentalClass: 'III - Perigoso ao meio ambiente',
    actionMode: 'Inibição da enzima EPSPS, bloqueando a síntese de aminoácidos aromáticos'
  },
  usage: [
    {
      crop: 'Soja',
      target: 'Plantas daninhas em geral',
      dose: '2,0 - 3,0 L/ha',
      application: 'Aplicação em pré-plantio'
    },
    {
      crop: 'Milho',
      target: 'Plantas daninhas em geral',
      dose: '2,0 - 3,0 L/ha',
      application: 'Aplicação em pré-plantio'
    },
    {
      crop: 'Algodão',
      target: 'Plantas daninhas em geral',
      dose: '2,5 - 3,5 L/ha',
      application: 'Aplicação em pré-plantio'
    }
  ],
  documents: [
    { name: 'Bula Completa', type: 'PDF', url: '#' },
    { name: 'FISPQ', type: 'PDF', url: '#' },
    { name: 'Certificado de Análise', type: 'PDF', url: '#' }
  ],
  logisticInfo: {
    dimensions: {
      '5L': '25cm x 20cm x 15cm',
      '20L': '38cm x 28cm x 20cm',
      '1000L': '100cm x 100cm x 120cm'
    },
    weight: {
      '5L': '5,85 kg',
      '20L': '23,40 kg',
      '1000L': '1170 kg'
    },
    palletization: {
      '5L': '60 unidades por palete',
      '20L': '24 unidades por palete',
      '1000L': '1 unidade por palete'
    },
    distributionCenter: 'Campinas - SP'
  },
  relatedProducts: [2, 5]
};

// Simplified mock related products
const RELATED_PRODUCTS = [
  {
    id: 2,
    name: 'Mancozeb Plus',
    manufacturer: 'FarmChem',
    activeIngredient: 'Mancozeb',
    concentration: '800 g/kg',
    image: '/placeholder.svg',
    price: 45.50,
    unit: 'Saco 25kg',
  },
  {
    id: 5,
    name: 'Atrazina Max',
    manufacturer: 'AgroTech',
    activeIngredient: 'Atrazina',
    concentration: '500 g/L',
    image: '/placeholder.svg',
    price: 68.20,
    unit: 'Galão 20L',
  }
];

const ProductDetail = () => {
  const { id: sku } = useParams(); // SKU from URL
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // Fetch real product data
  const { data: inventoryItems = [], isLoading: inventoryLoading, error: inventoryError } = useInventoryBySku(sku || '');
  const { data: documents = [], isLoading: documentsLoading } = useProductDocuments(sku || '');
  
  const [selectedImage, setSelectedImage] = useState('/placeholder.svg');
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);

  // Set default selections when data loads
  useEffect(() => {
    if (inventoryItems.length > 0 && !selectedItem) {
      setSelectedItem(inventoryItems[0]);
      // Set the price tier with the best price
      const bestPrice = Math.min(...inventoryItems.map(item => item.client_price));
      const bestTier = inventoryItems.find(item => item.client_price === bestPrice);
      setSelectedTier(bestTier);
    }
  }, [inventoryItems, selectedItem]);

  // Calculate price benefits
  const priceBenefits = inventoryItems.length > 0 ? InventoryService.calculatePriceBenefits(inventoryItems) : [];
  
  // Get product info from first inventory item
  const productInfo = inventoryItems[0];
  
  // Group inventory by location
  const locationGroups = inventoryItems.reduce((acc, item) => {
    const key = `${item.city}, ${item.state}`;
    if (!acc[key]) {
      acc[key] = { items: [], totalVolume: 0 };
    }
    acc[key].items.push(item);
    acc[key].totalVolume += item.volume_available;
    return acc;
  }, {} as Record<string, { items: any[], totalVolume: number }>);
  
  // Check user permissions and track page view
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar os detalhes do produto.",
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

    // Track page view and product interaction
    if (sku) {
      analyticsService.trackPageView(`/products/${sku}`, `Produto: ${sku}`);
      analyticsService.trackProductView(sku);
    }
  }, [navigate, toast, sku]);
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!selectedItem || !productInfo) return;
    
    const cartItem = {
      id: selectedItem.id,
      name: productInfo.product_name,
      sku: productInfo.product_sku,
      price: selectedItem.client_price,
      manufacturer: productInfo.manufacturer,
      image: '/placeholder.svg'
    };
    
    // Check if volume was optimized (different from default 1000L or has savings)
    const volume = selectedItem.volume || 1000;
    const isOptimized = volume !== 1000 || (selectedItem.savings && selectedItem.savings > 0);
    
    addToCart(cartItem, volume, selectedItem.client_price, selectedItem.savings || 0, isOptimized);
    toast({
      title: "Produto adicionado",
      description: `${productInfo.product_name} foi adicionado ao carrinho.`
    });
  };
  
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };
  
  const totalPrice = selectedItem ? selectedItem.client_price * quantity : 0;
  
  // Loading state
  if (inventoryLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="container-custom py-8">
            <Skeleton className="h-6 w-96 mb-4" />
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="w-full lg:w-2/5">
                <Skeleton className="h-80 w-full mb-4" />
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-20" />)}
                </div>
              </div>
              <div className="w-full lg:w-3/5">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-1/2 mb-6" />
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                </div>
                <Skeleton className="h-32 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (inventoryError || !productInfo) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 bg-background">
          <div className="container-custom py-8">
            <Card className="p-8 text-center">
              <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
              <p className="text-muted-foreground mb-6">
                {inventoryError ? `Erro: ${inventoryError.message}` : 'O produto solicitado não foi encontrado.'}
              </p>
              <Button onClick={() => navigate('/products')}>
                Voltar ao Catálogo
              </Button>
            </Card>
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
        {/* Breadcrumbs */}
        <div className="container-custom py-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <Link to="/" className="hover:text-agro-green">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/products" className="hover:text-agro-green">Produtos</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{productInfo.product_name}</span>
          </div>
        </div>

        <div className="container-custom py-6">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Product Images */}
            <div className="w-full lg:w-2/5">
              <div className="border rounded-lg bg-white p-4 mb-4">
                <img 
                  src={selectedImage} 
                  alt={productInfo.product_name}
                  className="object-contain w-full h-80"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImage('/placeholder.svg')}
                  className={`border rounded-md p-2 w-20 h-20 ${selectedImage === '/placeholder.svg' ? 'border-agro-green' : ''}`}
                >
                  <img 
                    src="/placeholder.svg"
                    alt="Produto"
                    className="object-contain w-full h-full"
                  />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col border rounded-lg bg-white p-6">
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold">{productInfo.product_name}</h1>
                  <div className="flex gap-2 items-center mt-2">
                    <span className="text-muted-foreground">Fabricante:</span>
                    <span className="text-agro-green font-medium">{productInfo.manufacturer}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline">SKU: {productInfo.product_sku}</Badge>
                    {productInfo.mapa_number && (
                      <Badge variant="outline">MAPA: {productInfo.mapa_number}</Badge>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Ingrediente Ativo</span>
                    <span className="font-medium">{productInfo.active_ingredient || 'N/A'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Embalagem</span>
                    <span className="font-medium">{productInfo.packaging}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Volume Total Disponível</span>
                    <span className="font-medium">{inventoryItems.reduce((sum, item) => sum + item.volume_available, 0).toLocaleString('pt-BR')} L</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Locais Disponíveis</span>
                    <span className="font-medium">{Object.keys(locationGroups).length} {Object.keys(locationGroups).length === 1 ? 'local' : 'locais'}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Data de Vencimento</span>
                    <span className="font-medium">{new Date(productInfo.expiry_date).toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Disponibilidade</span>
                    <Badge variant={inventoryItems.length > 0 ? "default" : "destructive"}>
                      {inventoryItems.length > 0 ? 'Em estoque' : 'Indisponível'}
                    </Badge>
                  </div>
                </div>
                
                {/* Dynamic Price Card */}
                <div className="mb-6">
                  <DynamicPriceCard 
                    inventoryItems={inventoryItems}
                    onVolumeChange={(volume, price, savings) => {
                      // Track volume changes for analytics
                      analyticsService.trackVolumeChange(productInfo.product_sku, volume, price);
                    }}
                    minVolume={1000}
                  />
                </div>

                {/* Location Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Selecionar Localização</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(locationGroups).map(([location, group]) => (
                      <Card 
                        key={location}
                        className={`cursor-pointer transition-colors ${
                          selectedItem && `${selectedItem.city}, ${selectedItem.state}` === location
                            ? 'border-agro-green bg-agro-green/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedItem(group.items[0])}
                      >
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{location}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Package className="h-3 w-3" />
                                <span>{group.totalVolume.toLocaleString('pt-BR')} L disponíveis</span>
                              </div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {group.items.length} {group.items.length === 1 ? 'lote' : 'lotes'}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-agro-green">
                                R$ {Math.min(...group.items.map(item => item.client_price)).toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">por L</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center border rounded-md">
                    <button 
                      onClick={decreaseQuantity}
                      className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:bg-muted"
                      disabled={quantity === 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <div className="w-12 text-center">{quantity}</div>
                    <button 
                      onClick={increaseQuantity}
                      className="flex items-center justify-center w-10 h-10 text-muted-foreground hover:bg-muted"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {selectedItem ? selectedItem.volume_available.toLocaleString('pt-BR') : 0} L disponíveis neste lote
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Preço por litro</p>
                    <p className="text-3xl font-bold">
                      R$ {selectedItem ? selectedItem.client_price.toFixed(2) : '0.00'}
                    </p>
                    <p className="text-xs text-muted-foreground">Local: {selectedItem ? `${selectedItem.city}/${selectedItem.state}` : 'Selecione'}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total ({quantity}L)</p>
                    <p className="text-2xl font-bold">
                      R$ {totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleBuyNow}
                    disabled={!selectedItem}
                  >
                    Comprar Agora
                  </Button>
                  
                  <div className="flex gap-3">
                    <Button 
                      size="lg" 
                      variant="outline"
                      className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                      onClick={handleAddToCart}
                      disabled={!selectedItem}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Adicionar ao Carrinho
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-12 w-12"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart 
                        className={isFavorite ? "h-5 w-5 fill-red-500 stroke-red-500" : "h-5 w-5"} 
                      />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-md flex items-start gap-2">
                  <Truck className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    <span className="font-medium">Consulte o frete para sua região</span> - 
                    Disponível para todo o Brasil {selectedItem && `, expedido a partir de ${selectedItem.city}/${selectedItem.state}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Detailed product information in tabs */}
          <div className="mt-8">
            <Tabs defaultValue="description">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent">
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="technical">Ficha Técnica</TabsTrigger>
                <TabsTrigger value="usage">Recomendações de Uso</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
                <TabsTrigger value="logistics">Informações Logísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="bg-white border rounded-lg mt-4 p-6">
                <h2 className="text-xl font-semibold mb-4">Descrição do Produto</h2>
                <p className="mb-4">{PRODUCT.description}</p>
                <p>
                  O {PRODUCT.name} é um herbicida sistêmico, não seletivo, formulado à base de {PRODUCT.activeIngredient} na 
                  concentração de {PRODUCT.concentration}, na formulação {PRODUCT.formulation}.
                </p>
                <p className="mt-4">
                  Registrado no Ministério da Agricultura, Pecuária e Abastecimento (MAPA) sob o número {PRODUCT.registerNumber}, 
                  este produto é indicado para o controle de plantas daninhas em diversas culturas.
                </p>
              </TabsContent>
              
              <TabsContent value="technical" className="bg-white border rounded-lg mt-4 p-6">
                <h2 className="text-xl font-semibold mb-4">Ficha Técnica</h2>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-3 bg-muted font-medium">Composição</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.composition}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 bg-muted font-medium">Densidade</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.density}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 bg-muted font-medium">pH</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.pH}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 bg-muted font-medium">Classe Toxicológica</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.toxicClass}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 bg-muted font-medium">Classe Ambiental</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.environmentalClass}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-3 bg-muted font-medium">Modo de Ação</td>
                        <td className="px-4 py-3">{PRODUCT.technicalInfo.actionMode}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </TabsContent>
              
              <TabsContent value="usage" className="bg-white border rounded-lg mt-4 p-6">
                <h2 className="text-xl font-semibold mb-4">Recomendações de Uso</h2>
                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted border-b">
                        <th className="px-4 py-3 text-left">Cultura</th>
                        <th className="px-4 py-3 text-left">Alvo</th>
                        <th className="px-4 py-3 text-left">Dose</th>
                        <th className="px-4 py-3 text-left">Aplicação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {PRODUCT.usage.map((item, index) => (
                        <tr key={index} className={index < PRODUCT.usage.length - 1 ? "border-b" : ""}>
                          <td className="px-4 py-3">{item.crop}</td>
                          <td className="px-4 py-3">{item.target}</td>
                          <td className="px-4 py-3">{item.dose}</td>
                          <td className="px-4 py-3">{item.application}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-4 p-3 bg-muted rounded-md flex items-start gap-2">
                  <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-sm">
                    Sempre consulte um engenheiro agrônomo e siga as instruções da bula para o uso correto deste produto.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="documents" className="bg-white border rounded-lg mt-4 p-6">
                <h2 className="text-xl font-semibold mb-4">Documentos</h2>
                <div className="space-y-4">
                  {PRODUCT.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-md p-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-red-100 text-red-800 h-10 w-10 rounded flex items-center justify-center">
                          {doc.type}
                        </div>
                        <span className="font-medium">{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-5 w-5" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="logistics" className="bg-white border rounded-lg mt-4 p-6">
                <h2 className="text-xl font-semibold mb-4">Informações Logísticas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-3">Dimensões</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(PRODUCT.logisticInfo.dimensions).map(([size, dimensions], index) => (
                            <tr key={size} className={index < Object.entries(PRODUCT.logisticInfo.dimensions).length - 1 ? "border-b" : ""}>
                              <td className="px-4 py-3 bg-muted font-medium">{size}</td>
                              <td className="px-4 py-3">{dimensions}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-3">Peso</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(PRODUCT.logisticInfo.weight).map(([size, weight], index) => (
                            <tr key={size} className={index < Object.entries(PRODUCT.logisticInfo.weight).length - 1 ? "border-b" : ""}>
                              <td className="px-4 py-3 bg-muted font-medium">{size}</td>
                              <td className="px-4 py-3">{weight}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Paletização</h3>
                  <div className="border rounded-md overflow-hidden">
                    <table className="w-full">
                      <tbody>
                        {Object.entries(PRODUCT.logisticInfo.palletization).map(([size, palletInfo], index) => (
                          <tr key={size} className={index < Object.entries(PRODUCT.logisticInfo.palletization).length - 1 ? "border-b" : ""}>
                            <td className="px-4 py-3 bg-muted font-medium">{size}</td>
                            <td className="px-4 py-3">{palletInfo}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-muted rounded-md">
                  <h3 className="font-medium mb-2">Centro de Distribuição</h3>
                  <p>{PRODUCT.logisticInfo.distributionCenter}</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Related Products */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {RELATED_PRODUCTS.map((product) => (
                <Card key={product.id}>
                  <CardContent className="p-4">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="object-contain w-full h-32 mb-4"
                    />
                    <h3 className="font-semibold mb-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{product.manufacturer}</p>
                    <p className="text-sm mb-4">
                      {product.activeIngredient} - {product.concentration}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="font-bold">R$ {product.price.toFixed(2)}</p>
                      <Button asChild size="sm">
                        <Link to={`/product/${product.id}`}>Ver</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
