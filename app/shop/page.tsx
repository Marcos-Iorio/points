import React from "react";

import { createClient } from "@/lib/supabase/server";
import Product from "@/components/shop/product/product";
import { notFound } from "next/navigation";

const ShopPage = async () => {
  const sb = await createClient();

  const { data: product, error } = await sb.from("products").select();

  if (!product?.[0].active) {
    notFound();
  }

  return (
    <div className="w-[90%] m-auto flex-1 flex flex-row gap-4">
      <Product product={product?.[0]} />
    </div>
  );
};

export default ShopPage;
