import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import { OptimizedCheckoutFlow } from '@/components/checkout/OptimizedCheckoutFlow';

const Checkout = () => {
  const { items } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Check if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      toast({
        title: "Carrinho vazio",  
        description: "Adicione produtos ao carrinho antes de finalizar a compra.",
        variant: "destructive"
      });
      navigate('/products');
    }
  }, [items, navigate, toast]);

    const checkoutItems = items.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      price: item.dynamicPrice || item.price,
      quantity: item.volume,
      manufacturer: item.manufacturer,
    }));

  const handleOrderComplete = (orderData: any) => {
    toast({
      title: "Pedido realizado com sucesso!",
      description: `Seu pedido foi confirmado.`,
    });
    navigate('/dashboard');
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