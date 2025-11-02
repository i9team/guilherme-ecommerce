import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../services/api';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariations: Record<string, string>;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, variations: Record<string, string>) => void;
  removeItem: (productId: string, variations: Record<string, string>) => void;
  updateQuantity: (productId: string, variations: Record<string, string>, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, quantity: number, variations: Record<string, string>) => {
    setItems(current => {
      const existingIndex = current.findIndex(
        item => item.product.id === product.id &&
        JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
      );

      if (existingIndex >= 0) {
        const updated = [...current];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...current, { product, quantity, selectedVariations: variations }];
    });
  };

  const removeItem = (productId: string, variations: Record<string, string>) => {
    setItems(current =>
      current.filter(
        item => !(item.product.id === productId &&
        JSON.stringify(item.selectedVariations) === JSON.stringify(variations))
      )
    );
  };

  const updateQuantity = (productId: string, variations: Record<string, string>, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variations);
      return;
    }

    setItems(current =>
      current.map(item =>
        item.product.id === productId &&
        JSON.stringify(item.selectedVariations) === JSON.stringify(variations)
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () => {
    return items.reduce((total, item) => {
      const price = item.product.discountPrice || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      getTotal,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}
