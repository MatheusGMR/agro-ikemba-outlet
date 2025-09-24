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
import { useProductImage } from '@/hooks/useProductImages';
import { ProductImage } from '@/components/ui/custom/ProductImage';
import DynamicPriceCard from '@/components/inventory/DynamicPriceCard';
import { ProductDocuments } from '@/components/inventory/ProductDocuments';
import { RelatedProducts } from '@/components/inventory/RelatedProducts';
import { ConversionModal } from '@/components/ui/ConversionModal';
import { InventoryService } from '@/services/inventoryService';
import { analyticsService } from '@/services/analyticsService';
import { useAuth } from '@/hooks/useAuth';
import { useUserApproval } from '@/hooks/useUserApproval';

// Mock data removed - using real data from inventory service

const ProductDetail = () => {
  const { id: sku } = useParams(); // SKU from URL
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  
  // Authentication hooks
  const { user } = useAuth();
  const { isApproved, isPending, isLoading: approvalLoading } = useUserApproval();
  
  // Fetch real product data
  const { data: inventoryItems = [], isLoading: inventoryLoading, error: inventoryError } = useInventoryBySku(sku || '');
  const { data: documents = [], isLoading: documentsLoading } = useProductDocuments(sku || '');
  const { data: productImage } = useProductImage(sku || '');
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);

  // Set default selections when data loads
  useEffect(() => {
    if (inventoryItems.length > 0 && !selectedItem) {
      setSelectedItem(inventoryItems[0]);
      // Set the price tier with the best price
      const bestPrice = Math.min(inventoryItems[0].preco_banda_menor, inventoryItems[0].preco_banda_maior);
      const bestTier = inventoryItems[0]; // Since all items have same prices now
      setSelectedTier(bestTier);
    }
    // Set default product image
    if (productImage?.image_url && !selectedImage) {
      setSelectedImage(productImage.image_url);
    }
  }, [inventoryItems, selectedItem, productImage, selectedImage]);

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
  

  // Track page view after authentication check
  useEffect(() => {
    if (sku && user && isApproved) {
      // Update analytics service with current user
      analyticsService.updateCurrentUser(user);
      analyticsService.trackPageView(`/products/${sku}`, `Produto: ${sku}`);
      analyticsService.trackProductView(sku);
    }
  }, [sku, user, isApproved]);
  
  const increaseQuantity = () => {
    setQuantity(prev => prev + 1);
  };
  
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleAddToCart = () => {
    if (!user || !isApproved) {
      setShowConversionModal(true);
      return;
    }
    
    if (!selectedItem || !productInfo) return;
    
    // Use currentPrice from DynamicPriceCard if available, otherwise use preco_unitario
    const itemPrice = selectedItem.currentPrice || selectedItem.preco_unitario;
    const itemVolume = selectedItem.volume || 1000;
    
    const cartItem = {
      id: selectedItem.id,
      name: productInfo.product_name,
      sku: productInfo.product_sku,
      price: itemPrice,
      manufacturer: productInfo.manufacturer,
      image: selectedImage || '/placeholder.svg'
    };
    
    // Check if volume was optimized (different from default 1000L or has savings)
    const isOptimized = itemVolume !== 1000 || (selectedItem.savings && selectedItem.savings > 0);
    
    addToCart(cartItem, itemVolume, itemPrice, selectedItem.savings || 0, isOptimized);
    toast({
      title: "Produto adicionado",
      description: `${productInfo.product_name} foi adicionado ao carrinho.`
    });
  };
  
  const handleBuyNow = () => {
    if (!user || !isApproved) {
      setShowConversionModal(true);
      return;
    }
    
    handleAddToCart();
    navigate('/checkout');
  };
  
  const totalPrice = selectedItem ? (selectedItem.currentPrice || selectedItem.preco_unitario) * quantity : 0;
  
  // Loading state - include approval loading
  if (inventoryLoading || approvalLoading) {
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
                <ProductImage 
                  src={selectedImage}
                  alt={productInfo.product_name}
                  className="h-80"
                  fallbackClassName="h-80"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedImage(selectedImage)}
                  className="border rounded-md p-2 w-20 h-20 border-agro-green"
                >
                  <ProductImage 
                    src={selectedImage}
                    alt={productInfo.product_name}
                    className="w-full h-full"
                    fallbackClassName="w-full h-full"
                  />
                </button>
              </div>
            </div>

            {/* Product Info */}
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col border rounded-lg bg-white p-6">
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold">{productInfo.active_ingredient || productInfo.product_name}</h1>
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
                    <span className="text-sm text-muted-foreground">Nome Técnico</span>
                    <span className="font-medium">{productInfo.product_name}</span>
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
                      // Update selected item with new pricing info
                      if (selectedItem) {
                        setSelectedItem({
                          ...selectedItem,
                          volume,
                          savings,
                          // Use the calculated price from DynamicPriceCard
                          currentPrice: price
                        });
                      }
                      // Analytics tracking is now handled internally by DynamicPriceCard
                    }}
                    onVolumeCommit={(volume, price, savings) => {
                      // Final volume commit - can be used for additional logic if needed
                      console.log(`Volume committed: ${volume}L at R$${price}/L`);
                    }}
                    minVolume={1000}
                    initialVolumePercentage={100}
                  />
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
                      R$ {selectedItem ? (selectedItem.currentPrice || selectedItem.preco_unitario).toFixed(2) : '0.00'}
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
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="documents">Documentos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Informações Técnicas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Ingrediente Ativo:</span>
                        <p className="text-muted-foreground">{productInfo.active_ingredient || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Embalagem:</span>
                        <p className="text-muted-foreground">{productInfo.packaging}</p>
                      </div>
                      <div>
                        <span className="font-medium">SKU:</span>
                        <p className="text-muted-foreground">{productInfo.product_sku}</p>
                      </div>
                      {productInfo.mapa_number && (
                        <div>
                          <span className="font-medium">Registro MAPA:</span>
                          <p className="text-muted-foreground">{productInfo.mapa_number}</p>
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Fabricante:</span>
                        <p className="text-muted-foreground">{productInfo.manufacturer}</p>
                      </div>
                      <div>
                        <span className="font-medium">Vencimento:</span>
                        <p className="text-muted-foreground">{new Date(productInfo.expiry_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="documents" className="space-y-4">
                <ProductDocuments 
                  documents={documents} 
                  productName={productInfo.product_name}
                />
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Related Products */}
          <RelatedProducts currentSku={sku} maxItems={4} />
        </div>
      </main>
      <Footer />
      
      <ConversionModal 
        open={showConversionModal}
        onOpenChange={setShowConversionModal}
        featureRequested="Compra de produtos"
      />
    </div>
  );
};

export default ProductDetail;
