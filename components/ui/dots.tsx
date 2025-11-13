"use client";

import React, { Dispatch, SetStateAction } from "react";
import TranslateEffect from "./translate-effect";

interface DotsProps {
  totalDots: number;
  active: number;
  setActiveDot: Dispatch<SetStateAction<number>>;
}

const Dots = ({ totalDots, active, setActiveDot }: DotsProps) => {
  const totalOfDots = Array.from({ length: totalDots }, (_, index) => index);
  const dotWidth = 8;
  const gap = 8;

  return (
    <div className="flex flex-row gap-2 relative">
      <TranslateEffect
        isVertical={false}
        width={dotWidth}
        gap={gap}
        active={active}
        className={`w-2 h-2 rounded-full bg-black/70 absolute top-0 left-0 transition-all duration-300`}
      />
      {totalOfDots.map((d, index) => (
        <div
          className={`w-2 h-2 rounded-full bg-black/30 cursor-pointer`}
          onClick={() => setActiveDot(index)}
          key={index}
        />
      ))}
    </div>
  );
};

export default Dots;
