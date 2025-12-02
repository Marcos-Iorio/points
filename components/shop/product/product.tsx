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
  selectedPlan?: Plan | null;
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

  const hasPromotion = product.promotion_price !== 0;

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
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-end gap-4">
            <div>
              <p
                className={`${
                  hasPromotion
                    ? "text-2xl text-text-secondary line-through"
                    : "text-3xl text-text-primary font-bold"
                }`}
              >
                {formatPrice(product.price)}
              </p>
              {hasPromotion && (
                <p className="text-3xl font-bold text-text-primary">
                  {formatPrice(product.promotion_price)}
                </p>
              )}
            </div>
            {hasPromotion && (
              <p className="rounded-full bg-accent-primary text-xl font-bold px-3 py-1">
                -{calculatePercentage(product.price, product.promotion_price)}%
              </p>
            )}
          </div>

          <AddToCartButton
            product={product}
            disabled={selectedPlan == null}
            onAddToCart={handleAddToCart}
            selectedPlan={selectedPlan}
          />
        </div>
      </div>
    </>
  );
};

export default Product;
