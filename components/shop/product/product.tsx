"use client";

import React, { useState } from "react";
import AddToCartButton from "./add-to-cart-button";
import { ProductType } from "@/types/product";
import Images from "./images";
import SelectPlan from "./select-plan";
import { Plan } from "@/types/subscription";

export interface ProductProps {
  product: ProductType;
}

const Product = ({ product }: ProductProps) => {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <>
      <Images images={product.images || {}} />
      <div className="bg-surface border border-soft rounded-lg w-2/5 p-8 flex flex-col gap-8">
        <h2 className="text-5xl text-text-primary font-bold">{product.name}</h2>
        <div
          className="text-lg text-text-secondary"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <SelectPlan setSelectedPlan={setSelectedPlan} />
        <AddToCartButton product={product} />
      </div>
    </>
  );
};

export default Product;
