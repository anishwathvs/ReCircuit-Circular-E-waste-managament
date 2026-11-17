import React, { createContext, useContext, useState, useEffect } from 'react';
import { MarketplaceListing } from '../types';

interface CartContextType {
  cart: MarketplaceListing[];
  addToCart: (item: MarketplaceListing) => void;
  removeFromCart: (listingId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<MarketplaceListing[]>(() => {
    try {
      const saved = localStorage.getItem('recircuit_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('recircuit_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: MarketplaceListing) => {
    if (!cart.some(i => i.id === item.id)) {
      setCart(prev => [...prev, item]);
      setIsCartOpen(true);
    }
  };

  const removeFromCart = (listingId: string) => {
    setCart(prev => prev.filter(i => i.id !== listingId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.sellingPrice, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isCartOpen, setIsCartOpen, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

