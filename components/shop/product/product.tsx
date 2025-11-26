"use client";

import React, { Dispatch, SetStateAction, useState } from "react";
import AddToCartButton from "./add-to-cart-button";
import { ProductType } from "@/types/product";
import Images from "./images";
import SelectPlan from "./select-plan";
import { Plan } from "@/types/subscription";
import { calculatePercentage } from "@/utils/calculate-percentage";
import { formatPrice } from "@/utils/format-price";

export interface ProductProps {
  product: ProductType;
}

export interface IError {
  type: "quantity" | "plan";
  message: string;
}

export interface AddToCartButtonProps extends ProductProps {
  disabled: boolean;
  onAddToCart: () => boolean;
}

const Product = ({ product }: ProductProps) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<IError | null>(null);

  const handleSetSelectedPlan = (plan: React.SetStateAction<Plan | null>) => {
    setSelectedPlan(plan);
    setError(null);
  };

  const handleAddToCart = () => {
    if (!selectedPlan) {
      setError({
        type: "plan",
        message: "Seleccioná un plan antes de agregar al carrito",
      });
      return false;
    }
    setError(null);
    return true;
  };

  return (
    <>
      <Images images={product.images || {}} />
      <div className="bg-surface border border-soft rounded-lg w-2/5 p-8 flex flex-col gap-8">
        <h2 className="text-5xl text-text-primary font-bold">{product.name}</h2>
        <div
          className="text-lg text-text-secondary"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <SelectPlan
          setSelectedPlan={handleSetSelectedPlan}
          selectedPlan={selectedPlan}
          error={error?.type === "plan" ? error.message : null}
        />
        <div>
          <p>{formatPrice(product.promotion_price)}</p>
          <p>{product.price}</p>
        </div>
        <p className="mt-auto">
          -{calculatePercentage(product.price, product.promotion_price)}%
        </p>
        <AddToCartButton
          product={product}
          disabled={selectedPlan == null}
          onAddToCart={handleAddToCart}
        />
      </div>
    </>
  );
};

export default Product;
