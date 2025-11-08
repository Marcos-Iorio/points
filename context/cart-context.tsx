import { ProductType } from "@/types/product";
import React, { useState, createContext, ReactNode } from "react";

type CartContextType = {
  cartItems: ProductType[];
  addToCart: (item: ProductType) => void;
};

export const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
});

const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<ProductType[]>([]);

  const addToCart = (item: ProductType) => {
    setCartItems((prev) => [...prev, item]);
  };

  return (
    <CartContext.Provider value={{ addToCart, cartItems }}>
      {children}
    </CartContext.Provider>
  );
};
