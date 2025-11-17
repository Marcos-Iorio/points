import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { AddToCartButtonProps, ProductProps } from "./product";
import useCart from "@/hooks/useCart";

const AddToCartButton = ({ product, disabled }: AddToCartButtonProps) => {
  const [quantity, setQuantity] = useState<number>(0);

  const { addToCart } = useCart();

  const addQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const substrackQuantity = () => {
    if (quantity === 0) {
      return;
    }
    setQuantity((prev) => prev - 1);
  };

  const sendToCart = () => {
    if (quantity === 0) {
      return;
    }

    const newItem = {
      ...product,
      quantity: quantity,
    };

    addToCart(newItem);
  };

  return (
    <div className="flex flex-row mt-auto justify-center w-full gap-8 h-14">
      <div className="flex justify-center gap-1 items-center  p-0 m-0 flex-1/4">
        <button
          onClick={addQuantity}
          className="text-lg font-bold bg-hover-light hover:bg-border rounded-lg p-2 w-12 h-10 cursor-pointer flex-1 flex justify-center"
        >
          <Plus className="w-5 h-auto" />
        </button>
        <p className="text-lg p-2 font-bold text-center bg-hover-light w-12 h-10 rounded-lg grid content-center">
          {quantity}
        </p>
        <button
          onClick={substrackQuantity}
          className="text-lg font-bold bg-hover-light hover:bg-border rounded-lg p-2 w-12 h-10 cursor-pointer flex-1  flex justify-center"
        >
          <Minus className="w-5 h-auto" />
        </button>
      </div>
      <Button
        onClick={sendToCart}
        disabled={quantity === 0 || disabled}
        className="h-full flex-3/4 rounded-lg text-xl"
      >
        Agregar al carrito
      </Button>
    </div>
  );
};

export default AddToCartButton;
