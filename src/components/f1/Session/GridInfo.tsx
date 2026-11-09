"use client";

import React from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { type DriverSummary, gridChange, isQualifyingKind, type SessionKind } from "../../../lib/openf1";

/** Posição por extenso curto: "7º" em português, "P7" em inglês. */
export function usePlace() {
  const { lang } = useLanguage();
  return (n: number) => (lang === "pt" ? `${n}º` : `P${n}`);
}

/** Seta com quantas posições o piloto subiu (verde) ou perdeu (vermelho). */
export function GridDelta({ change }: { change: number | null }) {
  if (!change) return null;
  const up = change > 0;
  return (
    <span className={`font-mono text-[10px] font-bold tabular-nums ${up ? "text-emerald-400" : "text-red-400"}`}>
      <span aria-hidden="true">{up ? "▲" : "▼"}</span>
      <span className="sr-only">{up ? "+" : "−"}</span>
      {Math.abs(change)}
    </span>
  );
}

/**
 * Aviso na qualificação quando punições mudaram o grid: quem larga atrás da posição que conquistou.
 * (Quem perde posições do resultado para o grid só pode ter sido punido; os outros sobem por consequência.)
 */
export function GridPenalties({ rows, kind }: { rows: DriverSummary[]; kind: SessionKind | null }) {
  const { dict } = useLanguage();
  const t = dict.session;
  const place = usePlace();
  if (!isQualifyingKind(kind)) return null;
  const penalized = rows.filter((row) => (gridChange(row, kind) ?? 0) < 0);
  if (!penalized.length) return null;

  return (
    <div className="reveal glass flex flex-col gap-3 rounded-2xl border-amber-500/30 px-4 py-3.5 lg:flex-row lg:items-center lg:gap-5" style={{ "--i": 2 } as React.CSSProperties}>
      <div className="flex flex-col gap-1 lg:max-w-md">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-400">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3 2.5 20h19L12 3zM12 10v4.5M12 17.5h.01" />
          </svg>
          {t.gridPenalties}
        </span>
        <p className="text-xs leading-relaxed text-zinc-300 text-pretty">{t.gridNote}</p>
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {penalized.map((row) => (
          <li key={row.driver.driver_number} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-2.5 text-xs">
            <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: row.color }} aria-hidden="true" />
            <span className="font-black tracking-wide text-white">{row.driver.name_acronym}</span>
            <span className="font-mono tabular-nums text-zinc-400">
              {place(row.position)} <span aria-hidden="true">→</span> <span className="font-bold text-red-400">{place(row.grid!)}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
