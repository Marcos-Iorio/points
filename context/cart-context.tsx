"use client";

import { CartItem } from "@/types/cart";
import React, { createContext, ReactNode } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
};

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
});

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>("cart", []);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex((i) => i.id === item.id);

      if (existingItemIndex !== -1) {
        // Si el producto ya existe, actualizar la cantidad
        const updatedItems = [...prev];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + item.quantity,
        };
        return updatedItems;
      }

      // Si no existe, agregarlo al array
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((p) => p.id != id));
  };

  return (
    <CartContext.Provider value={{ addToCart, removeFromCart, cartItems }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
