"use client";

import React, { useEffect, useRef, useState } from "react";
import { IImages, ProductType } from "@/types/product";
import Dots from "@/components/ui/dots";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomMouse from "./custom-mouse";
import TranslateEffect from "@/components/ui/translate-effect";

type ImagesProps = Pick<ProductType, "images">;

const getPublicImageUrl = (imagePath: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${imagePath}`;
};

const Images = ({ images }: ImagesProps) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const heightOfImage = 60;
  const gap = 20;

  if (!images || images.length === 0) {
    return <div>No hay imágenes disponibles</div>;
  }

  const Previous = () => {
    return (
      <button
        role="button"
        className="bg-black/20 h-10 w-10 flex justify-center items-center rounded-lg cursor-pointer hover:bg-black/30 z-10"
        onClick={() =>
          setActiveImage((prev) => (prev > 0 ? prev - 1 : images.length - 1))
        }
      >
        <ChevronLeft className="text-white" />
      </button>
    );
  };

  const Next = () => {
    return (
      <button
        role="button"
        className="bg-black/20  h-10 w-10 flex justify-center items-center rounded-lg cursor-pointer hover:bg-black/30 z-10"
        onClick={() =>
          setActiveImage((prev) => (prev < images.length - 1 ? prev + 1 : 0))
        }
      >
        <ChevronRight className="text-white" />
      </button>
    );
  };

  return (
    <section className="flex flex-col h-full w-3/5 gap-5 justify-center items-center">
      <div className="flex flex-row gap-5 h-full justify-start w-full">
        <div className="flex flex-col gap-5 relative max-w-22 w-full select-none">
          <TranslateEffect
            isVertical={true}
            active={activeImage}
            height={heightOfImage}
            gap={gap}
            className={`absolute top-0 left-0 max-h-17 h-full w-full border-2 border-accent-secondary rounded-sm bg-black/30 transition-all duration-300 z-10 `}
          />
          {images.map((image, index) => (
            <React.Fragment key={image.id}>
              <div
                className={`w-full max-h-15 h-full justify-start items-start cursor-pointer relative select-none transition-all duration-100 `}
                onClick={() => setActiveImage(index)}
              >
                <img
                  src={getPublicImageUrl(image.image_url)}
                  alt="rest-of-images"
                  className="w-full h-auto object-contain rounded-sm select-none"
                />
              </div>
            </React.Fragment>
          ))}
        </div>
        <div className="w-full flex justify-center flex-col gap-5 items-center">
          <div className="w-full relative " ref={imageContainerRef}>
            <div className="absolute top-1/2 left-0 flex flex-row justify-between w-full px-10 m-auto z-20">
              <Previous />
              <Next />
            </div>
            <CustomMouse containerRef={imageContainerRef} imageRef={imageRef} />
            <img
              ref={imageRef}
              src={getPublicImageUrl(images[activeImage].image_url)}
              alt={"active-image"}
              className="w-full rounded-lg z-0 cursor-none select-none"
            />
          </div>
          <Dots
            totalDots={images.length}
            active={activeImage}
            setActiveDot={setActiveImage}
          />
        </div>
      </div>
    </section>
  );
};

export default Images;
