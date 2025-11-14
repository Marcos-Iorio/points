"use client";

import React, { useEffect, useState } from "react";

interface CustomMouseProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  imageRef: React.RefObject<HTMLImageElement | null>;
}

const CustomMouse = ({ containerRef, imageRef }: CustomMouseProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });
  const [isInsideContainer, setIsInsideContainer] = useState(false);
  const [imageSrc, setImageSrc] = useState("");

  // Actualizar imageSrc cuando la imagen cambia
  useEffect(() => {
    const image = imageRef.current;
    if (image) {
      setImageSrc(image.src);

      // Listener para detectar cuando cambia el src
      const observer = new MutationObserver(() => {
        if (image.src) {
          setImageSrc(image.src);
        }
      });

      observer.observe(image, {
        attributes: true,
        attributeFilter: ["src"],
      });

      return () => observer.disconnect();
    }
  }, [imageRef]);

  useEffect(() => {
    const container = containerRef.current;
    const image = imageRef.current;
    if (!container || !image) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const isInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      // Verificar si el mouse está sobre un botón o elemento interactivo
      const target = e.target as HTMLElement;
      const isOverButton =
        target.tagName === "BUTTON" ||
        target.closest("button") !== null ||
        target.classList.contains("cursor-pointer");

      setIsInsideContainer(isInside && !isOverButton);

      if (isInside && !isOverButton) {
        setMousePosition({ x: e.clientX, y: e.clientY });

        if (image.src !== imageSrc) {
          setImageSrc(image.src);
        }

        // Calcular posición relativa (0 a 1)
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        setRelativePosition({ x: relX, y: relY });
      }
    };

    const handleMouseLeave = () => {
      setIsInsideContainer(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [containerRef, imageRef, imageSrc]);

  if (!isInsideContainer) return null;

  const zoomLevel = 20;
  const magnifierSize = 300;

  return (
    <>
      <div
        className="fixed pointer-events-none z-10 rounded-full border-4 border-white shadow-2xl overflow-hidden"
        style={{
          left: `${mousePosition.x}px`,
          top: `${mousePosition.y}px`,
          transform: `translate(-50%, -50%)`,
          width: `${magnifierSize}px`,
          height: `${magnifierSize}px`,
        }}
      >
        <div
          style={{
            backgroundImage: `url(${imageSrc})`,
            backgroundSize: `${zoomLevel * 100}%`,
            backgroundPosition: `${relativePosition.x * 100}% ${
              relativePosition.y * 100
            }%`,
            backgroundRepeat: "no-repeat",
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </>
  );
};

export default CustomMouse;
