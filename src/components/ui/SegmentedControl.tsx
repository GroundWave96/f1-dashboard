"use client";

import React from "react";

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  // "primary" = pílula vermelha (navegação principal da seção); "neutral" = cinza (filtros)
  variant?: "primary" | "neutral";
  size?: "md" | "sm";
  ariaLabel?: string;
  className?: string;
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  variant = "neutral",
  size = "md",
  ariaLabel,
  className = "",
}: SegmentedControlProps<T>) {
  const index = Math.max(0, options.findIndex((option) => option.value === value));
  const height = size === "md" ? "h-11 p-1" : "h-8 p-0.5";
  const pill = variant === "primary" ? "bg-red-600 shadow-lg shadow-red-900/30" : "bg-zinc-700";

  return (
    <div role="group" aria-label={ariaLabel} className={`relative flex items-center rounded-full border border-zinc-800 bg-zinc-900 ${height} ${className}`}>
      <div className="relative flex h-full w-full items-center">
        <span
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 rounded-full transition-transform duration-300 ease-fluid ${pill}`}
          style={{ width: `${100 / options.length}%`, transform: `translateX(${index * 100}%)` }}
        />
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(option.value)}
              className={`relative z-10 flex h-full flex-1 items-center justify-center px-2 font-bold uppercase tracking-tight whitespace-nowrap transition-[color,scale] duration-150 ease-fluid motion-safe:active:scale-[0.96] ${
                size === "md" ? "text-[11px] sm:text-xs" : "text-[10px]"
              } ${active ? "text-white" : "text-muted hover:text-zinc-300"}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
