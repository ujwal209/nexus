"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SliderProps {
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  step?: number;
  onValueChange?: (value: number[]) => void;
  className?: string;
}

export function Slider({
  value,
  defaultValue,
  min = 0,
  max = 100,
  step = 1,
  onValueChange,
  className,
}: SliderProps) {
  const currentValue = value ? value[0] : defaultValue ? defaultValue[0] : min;
  const percentage = ((currentValue - min) / (max - min)) * 100;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (onValueChange) {
      onValueChange([val]);
    }
  };

  return (
    <div
      onPointerDown={(e) => e.stopPropagation()}
      className={cn("relative flex w-full touch-none items-center select-none py-1.5", className)}
    >
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-75"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentValue}
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
      />
      <div
        className="absolute w-4 h-4 rounded-full border-2 border-primary bg-card shadow-md transition-all duration-75 pointer-events-none z-10 -ml-2"
        style={{ left: `${percentage}%` }}
      />
    </div>
  );
}
