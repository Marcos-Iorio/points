"use client";

import React, { ReactNode } from "react";

// @param isVertical determine if the translate effect is on X axis or Y axis default is false

interface ITranslateEffect {
  gap?: number;
  height?: number;
  width?: number;
  isVertical: boolean;
  className: string;
  active: number;
}

const TranslateEffect = ({
  gap = 0,
  height = 0,
  width = 0,
  isVertical = false,
  active,
  className,
}: ITranslateEffect) => {
  const translateX = active * (width + gap);
  const translateY = active * (height + gap);

  const translate = isVertical
    ? `translateY(${translateY}px)`
    : `translateX(${translateX}px)`;

  return <div style={{ transform: translate }} className={className}></div>;
};

export default TranslateEffect;
