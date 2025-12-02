import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import React from "react";
import { AddToCartButtonProps } from "./product";
import useCart from "@/hooks/useCart";
import { useAsyncAction } from "@/hooks/useAsyncAction";

const AddToCartButton = ({
  product,
  disabled,
  onAddToCart,
  selectedPlan,
}: AddToCartButtonProps) => {
  const [quantity, setQuantity] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const {
    isLoading: isAdding,
    isSuccess,
    executeAction,
  } = useAsyncAction(1000, 2000);

  const { addToCart, cartItems } = useCart();

  const addQuantity = () => {
    setQuantity((prev) => prev + 1);
    setError(null);
  };

  const substrackQuantity = () => {
    if (quantity === 0) {
      return;
    }
    setQuantity((prev) => prev - 1);
    setError(null);
  };

  const sendToCart = async () => {
    if (quantity === 0) {
      setError("Seleccioná una cantidad antes de agregar al carrito");
      return;
    }

    // Validar con el padre (chequea plan)
    const isValid = onAddToCart();

    if (!isValid) {
      return;
    }

    await executeAction(() => {
      const newItem = {
        ...product,
        quantity: quantity,
        selectedPlan: selectedPlan || undefined,
      };

      addToCart(newItem);
      setError(null);
    });
  };

  useEffect(() => {
    setQuantity(0);
  }, [isSuccess]);

  return (
    <div className="flex flex-col mt-auto justify-center w-full gap-2">
      {error && (
        <p className="text-red-500 text-sm font-medium text-center">{error}</p>
      )}
      <div className="flex flex-row justify-center w-full gap-8 h-14">
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
        <div className="flex-3/4 flex justify-center items-center">
          <Button
            onClick={sendToCart}
            disabled={isAdding || isSuccess}
            className={`h-full w-full rounded-lg text-xl relative overflow-hidden transition-all duration-300 ${
              isAdding && "w-15 rounded-full"
            } ${isSuccess && "bg-accent-primary"}`}
          >
            <span
              className={`transition-all duration-300 ${
                isAdding || isSuccess ? "opacity-0" : "opacity-100"
              }`}
            >
              Agregar al carrito
            </span>
            {isAdding && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </span>
            )}
            {isSuccess && (
              <span className="text-text-primary absolute inset-0 flex items-center justify-center font-bold text-xl">
                ✓ Producto agregado
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartButton;
