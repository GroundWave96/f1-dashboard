import React from "react";

interface StatTilesProps {
  title: string;
  stats: { label: string; value?: number }[];
}

/** Linha de números grandes com rótulo (ex.: vitórias, pódios). Sem valor, mostra um placeholder pulsando. */
export default function StatTiles({ title, stats }: StatTilesProps) {
  return (
    <div className="w-full flex flex-col gap-2 mb-5">
      <span className="text-[10px] text-muted uppercase tracking-widest font-bold">{title}</span>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}>
        {stats.map((stat) => (
          <div key={stat.label} className="bg-zinc-800/50 rounded-lg py-2 border border-zinc-700/50 flex flex-col items-center">
            {stat.value === undefined ? (
              <span className="h-6 w-8 my-0.5 rounded bg-zinc-700/50 animate-pulse" />
            ) : (
              <span className="text-lg font-black text-white font-mono leading-tight">{stat.value}</span>
            )}
            <span className="text-[9px] text-muted uppercase tracking-wider font-bold">{stat.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
