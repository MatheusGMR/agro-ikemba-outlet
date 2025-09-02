import { Trash2, Plus, Minus, ShoppingBag, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, removeFromCart, updateItemVolume, getTotalPrice, isOpen, toggleCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    toggleCart();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={toggleCart}
      />
      
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-xl transform transition-transform duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Carrinho de Compras</h2>
          <Button variant="ghost" size="icon" onClick={toggleCart}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">Seu carrinho está vazio</p>
              <p className="text-sm text-gray-400">Adicione produtos para continuar</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-contain flex-shrink-0"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">{item.name}</h3>
                    <p className="text-xs text-gray-500">{item.manufacturer}</p>
                    <p className="text-xs text-gray-500">Volume: {item.volume.toLocaleString('pt-BR')}L</p>
                    <p className="text-sm font-semibold text-primary">
                      R$ {((item.dynamicPrice || item.price) * item.volume).toFixed(2)}
                    </p>
                    {item.savings && item.savings > 0 && (
                      <p className="text-xs text-green-600 font-medium">
                        Economia: R$ {item.savings.toFixed(2)}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">
                        R$ {(item.dynamicPrice || item.price).toFixed(2)}/L
                      </p>
                      
                      {/* Remove button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t p-4 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total:</span>
              <span className="text-xl font-bold text-primary">
                R$ {getTotalPrice().toFixed(2)}
              </span>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleCheckout}
            >
              Finalizar Compra
            </Button>
          </div>
        )}
      </div>
    </>
  );
}