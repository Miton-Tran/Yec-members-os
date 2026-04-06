"use client";

import React, { useRef, useEffect } from "react";

export default function WheelPicker({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: string }[];
  value: string;
  onChange: (val: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const itemHeight = 28;

  const handleScroll = () => {
    if (!containerRef.current) return;
    const scrollTop = containerRef.current.scrollTop;
    const centerIndex = Math.round(scrollTop / itemHeight);
    if (centerIndex >= 0 && centerIndex < options.length) {
      if (options[centerIndex].value !== value) {
        onChange(options[centerIndex].value);
      }
    }
  };

  useEffect(() => {
    if (containerRef.current) {
      const index = options.findIndex((o) => o.value === value);
      if (index !== -1) {
        containerRef.current.scrollTop = index * itemHeight;
      }
    }
  }, []); // Only on mount

  return (
    <div className="relative h-[48px] bg-transparent overflow-hidden group w-full">
      {/* Center Highlight */}
      <div className="absolute inset-x-0 top-[10px] h-[28px] rounded-md pointer-events-none flex items-center justify-center">
         <span className="opacity-0">Focus</span>
      </div>
      
      {/* Top and Bottom Fade */}
      <div className="absolute inset-x-0 top-0 h-[10px] bg-linear-to-b from-stone-50 to-transparent pointer-events-none z-10" />
      <div className="absolute inset-x-0 bottom-0 h-[10px] bg-linear-to-t from-stone-50 to-transparent pointer-events-none z-10" />

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto snap-y snap-mandatory bg-transparent"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; }` }} />
        
        {/* Padding Top */}
        <div className="h-[10px]" />
        
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <div
              key={opt.value}
              className={`h-[28px] flex items-center justify-center snap-center text-[15px] transition-all duration-200 cursor-pointer select-none ${
                isSelected ? "text-amber-600 font-bold scale-105" : "text-stone-300 font-medium scale-90 opacity-40 hover:opacity-80"
              }`}
              onClick={() => {
                onChange(opt.value);
                const idx = options.findIndex(o => o.value === opt.value);
                if (containerRef.current) {
                    containerRef.current.scrollTo({ top: idx * 28, behavior: "smooth" });
                }
              }}
            >
              {opt.label}
            </div>
          );
        })}
        
        {/* Padding Bottom */}
        <div className="h-[10px]" />
      </div>
    </div>
  );
}
