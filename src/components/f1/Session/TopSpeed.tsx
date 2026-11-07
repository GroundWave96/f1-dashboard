"use client";

import React from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import type { DriverSummary } from "../../../lib/openf1";

/** Velocidade máxima de cada piloto no ponto de medição, em barras na cor da equipe. */
export default function TopSpeed({ rows }: { rows: DriverSummary[] }) {
  const { dict } = useLanguage();
  const ranked = rows.filter((r) => r.topSpeed).sort((a, b) => b.topSpeed! - a.topSpeed!);
  if (!ranked.length) return null;

  const max = ranked[0].topSpeed!;
  // Escala começando um pouco abaixo do mais lento, para as diferenças de poucos km/h aparecerem
  const floor = Math.max(0, ranked[ranked.length - 1].topSpeed! - 15);

  return (
    <div className="glass rounded-3xl p-4 sm:p-5 flex flex-col gap-3 h-full">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <span className="block text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.session.topSpeed}</span>
          <span className="text-xs text-muted">{dict.session.topSpeedNote}</span>
        </div>
        <span className="font-mono text-[10px] text-muted">KM/H</span>
      </div>
      <ol className="flex flex-col gap-1">
        {ranked.map((row, index) => (
          <li key={row.driver.driver_number} className="grid grid-cols-[1.25rem_2.75rem_minmax(0,1fr)_2.5rem_2rem] items-center gap-2 text-sm">
            <span className="text-right text-xs tabular-nums text-muted">{index + 1}</span>
            <span className="font-black tracking-wide" style={{ color: row.color }}>{row.driver.name_acronym}</span>
            <span className="h-2.5 rounded-full bg-white/5 overflow-hidden" aria-hidden="true">
              <span
                className="grow-x block h-full rounded-full"
                style={{ width: `${((row.topSpeed! - floor) / (max - floor)) * 100}%`, backgroundColor: row.color, "--i": Math.min(index, 12) } as React.CSSProperties}
              />
            </span>
            <span className="text-right font-mono font-bold tabular-nums text-white">{row.topSpeed}</span>
            <span className="text-right font-mono text-[11px] tabular-nums text-muted">{index === 0 ? "" : `−${max - row.topSpeed!}`}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
