import { createContext, useContext, useState } from "react";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;

  // دعم منتجات المزاد
  auction_id?: string;
  is_auction_buy_now?: boolean;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getTotal: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (newItem: CartItem) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === newItem.id
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                quantity:
                  item.quantity + (newItem.quantity || 1),
              }
            : item
        );
      }

      return [...currentItems, newItem];
    });
  };

  const removeItem = (id: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity,
            }
          : item
      )
    );
  };

  const getTotal = () => {
    return items.reduce(
      (total, item) =>
        total + item.price * (item.quantity || 1),
      0
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        getTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used within a CartProvider"
    );
  }

  return context;
}
