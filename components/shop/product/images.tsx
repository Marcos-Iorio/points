"use client";

import React, { useState } from "react";
import { IImages, ProductType } from "@/types/product";

type ImagesProps = Pick<ProductType, "images">;

const getPublicImageUrl = (imagePath: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${imagePath}`;
};

const Images = ({ images }: ImagesProps) => {
  const [activeImage, setActiveImage] = useState<number>(0);

  if (!images || images.length === 0) {
    return <div>No hay imágenes disponibles</div>;
  }

  return (
    <section className="w-3/5 flex flex-row gap-5 h-full justify-start">
      <div className="flex flex-col gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`max-w-22 h-auto justify-start items-start cursor-pointer relative ${
              activeImage == index &&
              "after:content[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:bg-black/30 after:rounded-sm border-4 border-accent-secondary rounded-lg"
            }`}
            onClick={() => setActiveImage(index)}
          >
            <img
              src={getPublicImageUrl(image.image_url)}
              alt="rest-of-images"
              className="w-full h-auto object-contain rounded-sm"
            />
          </div>
        ))}
      </div>
      <div className="w-full">
        <img
          src={getPublicImageUrl(images[activeImage].image_url)}
          alt={"active-image"}
          className="w-full rounded-lg"
        />
      </div>
    </section>
  );
};

export default Images;
