"use client";

import React from "react";
import { useLanguage } from "../../../i18n/LanguageContext";

// Cores oficiais dos compostos (macio vermelho, médio amarelo, duro branco, intermediário verde, chuva azul)
const TYRES: Record<string, { letter: string; color: string }> = {
  SOFT: { letter: "S", color: "#ef4444" },
  MEDIUM: { letter: "M", color: "#facc15" },
  HARD: { letter: "H", color: "#f4f4f5" },
  INTERMEDIATE: { letter: "I", color: "#22c55e" },
  WET: { letter: "W", color: "#3b82f6" },
};

export default function TyreBadge({ compound, className = "w-6 h-6" }: { compound: string | null; className?: string }) {
  const { dict } = useLanguage();
  const tyre = compound ? TYRES[compound] : undefined;
  if (!tyre || !compound) return <span className={`${className} inline-block`} aria-hidden="true" />;
  const label = dict.session.tyres[compound as keyof typeof dict.session.tyres] ?? compound;

  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-full border-[2.5px] bg-zinc-950 text-[10px] font-black leading-none`}
      style={{ borderColor: tyre.color, color: tyre.color }}
    >
      {tyre.letter}
    </span>
  );
}
