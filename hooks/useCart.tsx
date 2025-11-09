"use client";

import { CartContext } from "@/context/cart-context";
import React, { useContext } from "react";

const useCart = () => {
  const ctx = useContext(CartContext);

  if (!ctx) {
    throw new Error("useCart debe usarse dentro de un CartProvider");
  }

  return ctx;
};

export default useCart;
