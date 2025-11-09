"use client";

import { ProductType } from "@/types/product";
import React, { useState, createContext, ReactNode } from "react";

type CartContextType = {
  cartItems: ProductType[];
  addToCart: (item: ProductType) => void;
  removeFromCart: (id: string) => void;
};

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
});

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<ProductType[]>([]);

  const addToCart = (item: ProductType) => {
    console.log(item);
    setCartItems((prev) => [...prev, item]);
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
