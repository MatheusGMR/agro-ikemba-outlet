import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { OptimizedCheckoutFlow } from '@/components/checkout/OptimizedCheckoutFlow';
import { CheckoutLoadingFallback } from '@/components/checkout/CheckoutLoadingFallback';

const Checkout = () => {
  const { items } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Initialize and validate cart
  useEffect(() => {
    console.log('Checkout: Initializing with items:', items);
    
    if (items.length === 0) {
      console.log('Checkout: Empty cart, redirecting to products');
      toast({
        title: "Carrinho vazio",  
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive"
      });
      navigate('/products');
    } else {
      console.log('Checkout: Cart has items, proceeding with checkout');
      setIsInitializing(false);
    }
  }, [items, navigate, toast]);

  // Show loading while initializing
  if (isInitializing) {
    console.log('Checkout: Still initializing...');
    return <CheckoutLoadingFallback />;
  }

  // Defensive mapping with error handling
  const checkoutItems = items.map(item => {
    if (!item) {
      console.error('Checkout: Invalid item found:', item);
      return null;
    }
    
    return {
      id: item.id || `temp-${Date.now()}`,
      name: item.name || 'Produto sem nome',
      sku: item.sku || '',
      price: item.dynamicPrice || item.price || 0,
      quantity: item.volume || 1,
      manufacturer: item.manufacturer || '',
    };
  }).filter(Boolean); // Remove null items

  console.log('Checkout: Mapped items:', checkoutItems);

  const handleOrderComplete = (orderData: any) => {
    toast({
      title: "Pedido realizado com sucesso!",
      description: `Seu pedido foi confirmado.`,
    });
    // Don't redirect immediately - user might want to see confirmation and download PDF
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-background">
        <div className="container-custom py-8">
          <OptimizedCheckoutFlow 
            cartItems={checkoutItems}
            onOrderComplete={handleOrderComplete}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;