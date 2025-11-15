"use client";

import React, { ReactNode } from "react";

// @param isVertical determine if the translate effect is on X axis or Y axis default is false
// @param itemRefs optional array of refs to calculate dynamic widths/heights

interface ITranslateEffect {
  gap?: number;
  height?: number;
  width?: number;
  isVertical: boolean;
  className: string;
  active: number;
  itemRefs?: (HTMLElement | null)[];
}

const TranslateEffect = ({
  gap = 0,
  height = 0,
  width = 0,
  isVertical = false,
  active,
  className,
  itemRefs,
}: ITranslateEffect) => {
  let translateX = active * (width + gap);
  let translateY = active * (height + gap);

  // Si se proveen refs, calcular el desplazamiento sumando los anchos/altos reales
  if (itemRefs && itemRefs.length > 0) {
    if (isVertical) {
      translateY = 0;
      for (let i = 0; i < active && i < itemRefs.length; i++) {
        const element = itemRefs[i];
        if (element) {
          translateY += element.offsetHeight + gap;
        }
      }
    } else {
      translateX = 0;
      for (let i = 0; i < active && i < itemRefs.length; i++) {
        const element = itemRefs[i];
        if (element) {
          translateX += element.offsetWidth + gap;
        }
      }
    }
  }

  const translate = isVertical
    ? `translateY(${translateY}px)`
    : `translateX(${translateX}px)`;

  return <div style={{ transform: translate }} className={className}></div>;
};

export default TranslateEffect;
