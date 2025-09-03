import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  manufacturer: string;
  price: number;
  volume: number;
  sku: string;
  image: string;
  activeIngredient: string;
  dynamicPrice?: number;
  savings?: number;
  isOptimized?: boolean; // Flag to track if volume was optimized in product page
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: any, volume: number, price: number, savings?: number, isOptimized?: boolean) => void;
  removeFromCart: (itemId: string) => void;
  updateItemVolume: (itemId: string, volume: number, price: number, savings?: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isOpen: boolean;
  toggleCart: () => void;
  hasOptimizedItems: () => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('agroikemba-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
      }
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem('agroikemba-cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (product: any, volume: number, price: number, savings?: number, isOptimized?: boolean) => {
    const itemId = product.sku || product.id;
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem) {
        // Update volume and price for existing item
        const updatedItems = prevItems.map(item =>
          item.id === itemId
            ? { 
                ...item, 
                volume: volume,
                price: price,
                dynamicPrice: price,
                savings: savings || 0,
                isOptimized: isOptimized || false
              }
            : item
        );
        
        toast({
          title: "Produto atualizado no carrinho",
          description: `${product.name} - Volume: ${volume.toLocaleString('pt-BR')}L`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        const newItem: CartItem = {
          id: itemId,
          productId: product.sku || product.id,
          name: product.name,
          manufacturer: product.manufacturer,
          price: price,
          volume: volume,
          sku: product.sku,
          image: product.image || '/placeholder.svg',
          activeIngredient: product.active_ingredient || product.activeIngredient || '',
          dynamicPrice: price,
          savings: savings || 0,
          isOptimized: isOptimized || false,
        };
        
        toast({
          title: "Produto adicionado ao carrinho",
          description: `${product.name} - Volume: ${volume.toLocaleString('pt-BR')}L`,
        });
        
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.id === itemId);
      if (item) {
        toast({
          title: "Produto removido do carrinho",
          description: `${item.name} foi removido do carrinho.`,
        });
      }
      return prevItems.filter(item => item.id !== itemId);
    });
  };

  const updateItemVolume = (itemId: string, volume: number, price: number, savings?: number) => {
    if (volume <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { 
              ...item, 
              volume: volume,
              price: price,
              dynamicPrice: price,
              savings: savings || 0
            }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    toast({
      title: "Carrinho limpo",
      description: "Todos os produtos foram removidos do carrinho.",
    });
  };

  const getTotalItems = () => {
    return items.length;
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.dynamicPrice || item.price) * item.volume, 0);
  };

  const toggleCart = () => {
    setIsOpen(!isOpen);
  };

  const hasOptimizedItems = () => {
    return items.some(item => item.isOptimized);
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateItemVolume,
    clearCart,
    getTotalItems,
    getTotalPrice,
    isOpen,
    toggleCart,
    hasOptimizedItems,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}