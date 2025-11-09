"use client";

import React from "react";
import AddToCartButton from "./add-to-cart-button";
import { ProductType } from "@/types/product";

export interface ProductProps {
  product: ProductType;
}

const Product = ({ product }: ProductProps) => {
  return (
    <>
      <div className="bg-surface border border-soft rounded-lg w-3/5 p-8"></div>
      <div className="bg-surface border border-soft rounded-lg w-2/5 p-8 flex flex-col gap-8">
        <h2 className="text-5xl text-text-primary font-bold">{product.name}</h2>
        <div
          className="text-lg text-text-secondary"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
        <AddToCartButton product={product} />
      </div>
    </>
  );
};

export default Product;
