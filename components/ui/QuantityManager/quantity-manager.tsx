"use client";

import { Plus, Minus } from "lucide-react";
import React from "react";

interface QuantityManagerProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

const QuantityManager = ({
  value,
  onIncrement,
  onDecrement,
  min = 0,
  max,
  disabled = false,
  className = "",
}: QuantityManagerProps) => {
  const isDecrementDisabled = disabled || value <= min;
  const isIncrementDisabled = disabled || (max !== undefined && value >= max);

  return (
    <div
      className={`flex justify-center gap-1 items-center p-0 m-0 flex-1/4 ${className}`}
    >
      <button
        onClick={onDecrement}
        disabled={isDecrementDisabled}
        className="text-lg font-bold bg-hover-light hover:bg-border rounded-lg p-2 w-12 h-10 cursor-pointer flex-1 flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Decrementar cantidad"
      >
        <Minus className="w-5 h-auto" />
      </button>
      <p className="text-lg p-2 font-bold text-center bg-hover-light w-12 h-10 rounded-lg grid content-center">
        {value}
      </p>
      <button
        onClick={onIncrement}
        disabled={isIncrementDisabled}
        className="text-lg font-bold bg-hover-light hover:bg-border rounded-lg p-2 w-12 h-10 cursor-pointer flex-1 flex justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Incrementar cantidad"
      >
        <Plus className="w-5 h-auto" />
      </button>
    </div>
  );
};

export default QuantityManager;
