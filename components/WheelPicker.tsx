"use client";

import React, { useRef, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

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

  const handleStep = (direction: 1 | -1) => {
    const currentIndex = options.findIndex((o) => o.value === value);
    let newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = 0;
    if (newIndex >= options.length) newIndex = options.length - 1;
    
    onChange(options[newIndex].value);
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: newIndex * itemHeight, behavior: "smooth" });
    }
  };

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

      {/* Up/Down Controls */}
      <div className="absolute right-0 top-0 bottom-0 flex flex-col justify-between py-1 px-0.5 bg-stone-50/80 backdrop-blur-sm border-l border-white/50 w-[24px]">
        <button
          type="button"
          onClick={() => handleStep(-1)}
          className="flex-1 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:bg-white rounded-t-sm transition-colors active:scale-95"
        >
          <ChevronUp className="size-4" />
        </button>
        <div className="h-px bg-stone-200/50 w-full" />
        <button
          type="button"
          onClick={() => handleStep(1)}
          className="flex-1 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:bg-white rounded-b-sm transition-colors active:scale-95"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  );
}
