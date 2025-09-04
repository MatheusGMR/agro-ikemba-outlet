import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useGroupedProductsForSales } from '@/hooks/useInventory';
import { usePageAnalytics, useProductAnalytics, useCheckoutAnalytics } from '@/hooks/useAnalytics';
import { 
  gtagReportConversion, 
  reportSignupConversion, 
  reportAddToCartConversion,
  reportQuoteRequestConversion,
  reportProductViewConversion 
} from '@/utils/googleAdsConversions';
import { formatCurrency } from '@/lib/utils';
import { 
  ShoppingCart, 
  TrendingDown, 
  Clock, 
  Shield, 
  CheckCircle, 
  Star,
  Zap,
  Package,
  Calculator
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [urgencyTimer, setUrgencyTimer] = useState(3600); // 1 hour countdown
  
  const { data: products = [], isLoading } = useGroupedProductsForSales();
  const { trackProductView } = useProductAnalytics();
  const { trackConversion } = useCheckoutAnalytics();

  usePageAnalytics({
    pagePath: '/landing',
    pageTitle: 'Defensivos Agrícolas - Oferta Especial',
    enableTimeTracking: true
  });

  // Countdown timer for urgency
  useEffect(() => {
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProductClick = (sku: string) => {
    setSelectedProduct(sku);
    trackProductView();
    
    const product = products.find(p => p.sku === sku);
    if (product) {
      reportProductViewConversion(product.main_item.client_price);
      
      // Google Ads event for product interest
      if (window.gtag) {
        window.gtag('event', 'view_item', {
          currency: 'BRL',
          value: product.main_item.client_price,
          items: [{
            item_id: sku,
            item_name: product.name
          }]
        });
      }
    }
  };

  const handleBuyNow = (product: any) => {
    trackConversion('lead', product.main_item.client_price);
    
    // Google Ads conversion for add to cart
    reportAddToCartConversion(product.main_item.client_price);
    
    // Navigate to checkout with product pre-selected
    window.location.href = `/checkout?product=${product.sku}&volume=1000`;
  };

  const handleGetQuote = (product: any) => {
    trackConversion('quote_request', product.main_item.client_price);
    
    // Google Ads conversion for quote request
    reportQuoteRequestConversion(product.main_item.client_price);
    
    // Navigate to contact/quote page
    window.location.href = `/register?product=${product.sku}&intent=quote`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const topProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10">
      {/* Hero Section with Urgency */}
      <section className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container-custom relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4 bg-destructive text-destructive-foreground animate-pulse">
              <Clock className="mr-2 h-4 w-4" />
              OFERTA POR TEMPO LIMITADO
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              <span className="text-yellow-300">ECONOMIZE ATÉ 20%</span><br />
              nos Melhores Defensivos Agrícolas
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-primary-foreground/90">
              Produtos de alta qualidade com <strong>preços exclusivos por volume</strong>.<br />
              Entrega garantida em todo o Brasil.
            </p>

            {/* Countdown Timer */}
            <div className="bg-destructive/90 backdrop-blur-sm rounded-lg p-6 mb-8 inline-block">
              <p className="text-lg font-semibold mb-2">Esta oferta expira em:</p>
              <div className="text-4xl font-mono font-bold tracking-wider">
                {formatTime(urgencyTimer)}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-4 bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Zap className="mr-2 h-5 w-5" />
                VER PRODUTOS EM OFERTA
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-4 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => handleGetQuote(null)}
              >
                <Calculator className="mr-2 h-5 w-5" />
                CALCULAR ECONOMIA
              </Button>
            </div>
          </div>
        </div>

        {/* Floating elements for visual appeal */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-400/20 rounded-full animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-16 h-16 bg-green-400/20 rounded-full animate-bounce"></div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <Shield className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">100% Originais</h3>
              <p className="text-muted-foreground text-sm">Produtos registrados</p>
            </div>
            <div className="flex flex-col items-center">
              <Package className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">Entrega Rápida</h3>
              <p className="text-muted-foreground text-sm">Todo o Brasil</p>
            </div>
            <div className="flex flex-col items-center">
              <Star className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">+ de 1000</h3>
              <p className="text-muted-foreground text-sm">Clientes satisfeitos</p>
            </div>
            <div className="flex flex-col items-center">
              <TrendingDown className="h-12 w-12 text-primary mb-3" />
              <h3 className="font-semibold">Melhor Preço</h3>
              <p className="text-muted-foreground text-sm">Garantido</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="py-16 bg-gradient-to-b from-white to-primary/5">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary">
              PRODUTOS EM DESTAQUE
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-foreground">
              Defensivos com <span className="text-primary">Preços Especiais</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Quanto maior o volume, maior sua economia. Aproveite nossos preços em banda para maximizar seus resultados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {topProducts.map((product) => {
              const hasMultipleTiers = product.all_items.length > 1;
              const unitPrice = product.main_item.client_price;
              const bestPrice = Math.min(...product.all_items.map(item => item.client_price));
              const maxSavings = ((unitPrice - bestPrice) / unitPrice) * 100;

              return (
                <Card 
                  key={product.sku} 
                  className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${
                    selectedProduct === product.sku ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => handleProductClick(product.sku)}
                >
                  {maxSavings > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-destructive text-destructive-foreground animate-pulse">
                        ECONOMIZE {maxSavings.toFixed(0)}%
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-2xl mb-2">{product.name}</CardTitle>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p><strong>Fabricante:</strong> {product.manufacturer}</p>
                          {product.active_ingredient && (
                            <p><strong>Ingrediente Ativo:</strong> {product.active_ingredient}</p>
                          )}
                          <p><strong>SKU:</strong> {product.sku}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price Tiers */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">Preços por Volume:</h4>
                      
                      {/* Unit Price */}
                      <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <span className="text-sm text-muted-foreground">Preço Unitário</span>
                          <p className="font-medium">Qualquer quantidade</p>
                        </div>
                        <span className="text-lg font-bold">
                          {formatCurrency(unitPrice)}/L
                        </span>
                      </div>

                      {/* Band Prices */}
                      {product.all_items
                        .filter(item => item.price_tier !== 'Preço Unitário')
                        .sort((a, b) => a.client_price - b.client_price)
                        .map((item, index) => {
                          const savings = unitPrice - item.client_price;
                          const savingsPercent = (savings / unitPrice) * 100;
                          
                          return (
                            <div 
                              key={`${item.price_tier}-${index}`}
                              className="flex justify-between items-center p-3 bg-primary/5 border border-primary/20 rounded-lg"
                            >
                              <div>
                                <span className="text-sm text-primary font-medium">
                                  {item.price_tier}
                                </span>
                                <p className="text-sm text-muted-foreground">
                                  Volume mínimo: 1000L
                                </p>
                                <p className="text-xs text-primary">
                                  Economia: {formatCurrency(savings)}/L ({savingsPercent.toFixed(1)}%)
                                </p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-primary">
                                  {formatCurrency(item.client_price)}/L
                                </span>
                                <p className="text-xs text-muted-foreground line-through">
                                  {formatCurrency(unitPrice)}/L
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    <Separator />

                    {/* Stock Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span>{product.total_volume.toLocaleString()}L disponíveis</span>
                      </div>
                      <Badge variant="outline">
                        {product.locations_count} localidades
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        className="flex-1 text-lg py-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(product);
                        }}
                      >
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        COMPRAR AGORA
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 text-lg py-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetQuote(product);
                        }}
                      >
                        <Calculator className="mr-2 h-5 w-5" />
                        COTAÇÃO
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Não Perca Esta Oportunidade!
          </h2>
          <p className="text-xl mb-8 text-primary-foreground/90 max-w-3xl mx-auto">
            Preços especiais por tempo limitado. Garante já seus defensivos com a melhor qualidade e economia garantida.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-4 bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
              onClick={() => {
                reportSignupConversion();
                window.location.href = '/register?intent=purchase';
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              CADASTRAR E COMPRAR
            </Button>
            <Link to="/products">
              <Button 
                size="lg"
                variant="outline"
                className="text-lg px-8 py-4 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              >
                VER TODOS OS PRODUTOS
              </Button>
            </Link>
          </div>

          <div className="text-sm text-primary-foreground/80">
            <p>🔒 Compra 100% segura • 📦 Entrega garantida • ⭐ Produtos originais</p>
          </div>
        </div>
      </section>
    </div>
  );
}