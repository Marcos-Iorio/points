"use client";

import React from "react";

const Dots = ({ totalDots, active }: { totalDots: number; active: number }) => {
  const totalOfDots = Array.from({ length: totalDots }, (_, index) => index);
  const dotWidth = 8; // w-2 = 0.5rem = 8px
  const gap = 8; // gap-2 = 0.5rem = 8px
  const translateX = active * (dotWidth + gap);

  return (
    <div className="flex flex-row gap-2 relative">
      <div
        style={{ transform: `translateX(${translateX}px)` }}
        className={`w-2 h-2 rounded-full bg-black/70 absolute top-0 left-0 transition-all duration-300`}
      ></div>
      {totalOfDots.map((d, index) => (
        <div className={`w-2 h-2 rounded-full bg-black/30 `} key={index} />
      ))}
    </div>
  );
};

export default Dots;
