"use client";

import { useCallback } from "react";

type Props = {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
};

export function AgeRangeSlider({ min, max, onChange }: Props) {
  const handleMin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.min(Number(e.target.value), max - 1);
      onChange(val, max);
    },
    [max, onChange]
  );

  const handleMax = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = Math.max(Number(e.target.value), min + 1);
      onChange(min, val);
    },
    [min, onChange]
  );

  return (
    <div className="flex flex-col gap-2">
      <div className="relative h-4 flex items-center">
        <div className="absolute w-full h-1.5 rounded-full bg-white/15" />
        <div
          className="absolute h-1.5 rounded-full bg-white/60"
          style={{
            left: `${min}%`,
            right: `${100 - max}%`,
          }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={min}
          onChange={handleMin}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer range-thumb"
          style={{ zIndex: min > 90 ? 5 : 3 }}
        />
        <input
          type="range"
          min={0}
          max={100}
          value={max}
          onChange={handleMax}
          className="absolute w-full appearance-none bg-transparent pointer-events-auto cursor-pointer range-thumb"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between text-xs text-white/30">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
