import React from "react";

// Visual compartilhado das linhas clicáveis das listas (classificação, resultados, qualificação)
export const rankRowClass =
  "group relative w-full grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2.5 sm:px-3 py-[clamp(0.3rem,0.95vh,0.8rem)] text-left transition-colors duration-150 ease-fluid hover:bg-zinc-800/60 focus-visible:bg-zinc-800/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-red-500";

interface RankFrameProps {
  count: number;
  ariaLabel: string;
  children: React.ReactNode;
}

/**
 * Moldura das listas ranqueadas: uma coluna com rolagem no celular e duas colunas
 * (1º–11º | 12º–22º) em telas largas, para caber sem rolagem (regras .rank-grid no globals.css).
 */
export default function RankFrame({ count, ariaLabel, children }: RankFrameProps) {
  return (
    <div className="rank-scroll max-h-full overflow-y-auto overscroll-contain custom-scrollbar rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl p-1.5 sm:p-2">
      <ol aria-label={ariaLabel} className="rank-grid" style={{ "--rows": Math.ceil(count / 2) } as React.CSSProperties}>
        {children}
      </ol>
    </div>
  );
}
