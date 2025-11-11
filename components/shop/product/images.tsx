"use client";

import React, { useState } from "react";
import { IImages, ProductType } from "@/types/product";
import Dots from "@/components/ui/dots";

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
    <section className="flex flex-col h-full w-3/5 gap-5 justify-center items-center">
      <div className="flex flex-row gap-5 h-full justify-start w-full">
        <div className="flex flex-col gap-2">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`max-w-22 h-auto justify-start items-start cursor-pointer relative select-none transition-all duration-100 ${
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
      </div>
      <Dots totalDots={images.length} active={activeImage} />
    </section>
  );
};

export default Images;
