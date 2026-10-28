import React from "react";

interface SectionHeaderProps {
  eyebrow: string;
  title: React.ReactNode;
  // Controles à direita (abas, seletores); no celular ficam abaixo do título
  actions?: React.ReactNode;
}

export default function SectionHeader({ eyebrow, title, actions }: SectionHeaderProps) {
  return (
    <div className="reveal shrink-0 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between" style={{ "--i": 0 } as React.CSSProperties}>
      <div className="min-w-0 text-center sm:text-left">
        <span className="block text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">{eyebrow}</span>
        <h2 className="font-bold text-white uppercase tracking-wider leading-tight text-[clamp(1.2rem,0.9rem+1.1vw,2.1rem)] text-balance">
          {title}
        </h2>
      </div>
      {actions && <div className="flex justify-center sm:justify-end shrink-0">{actions}</div>}
    </div>
  );
}
