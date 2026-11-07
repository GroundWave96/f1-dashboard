"use client";

import React, { useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { type DriverSummary, formatLap, type SessionData } from "../../../lib/openf1";
import SegmentedControl from "../../ui/SegmentedControl";

// Cor de cada setor (mesma lógica das transmissões: roxo, vermelho, amarelo)
const SECTOR_TINT = ["#a855f7", "#ef4444", "#eab308"];

/** Volta mais rápida × volta teórica e a classificação de cada setor. */
export default function SectorBoard({ data }: { data: SessionData }) {
  const { dict } = useLanguage();
  const t = dict.session;
  const [mobileSector, setMobileSector] = useState("0");
  if (!data.fastest || !data.bestSectors.every(Boolean)) return null;

  const fastestRow = data.rows.find((r) => r.driver.driver_number === data.fastest!.driver.driver_number);
  const delta = data.theoretical != null ? data.theoretical - data.fastest.lap : null;

  const ranking = (index: number) =>
    data.rows
      .filter((r) => r.sectors[index])
      .sort((a, b) => a.sectors[index]! - b.sectors[index]!);

  return (
    <div className="@container glass rounded-3xl p-4 sm:p-5 flex flex-col gap-4">
      <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{t.sectors}</span>

      <div className="grid gap-2 @2xl:grid-cols-2">
        <div className="rounded-2xl border border-purple-500/40 bg-purple-500/10 p-3 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-300">{t.fastestLap}</span>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">{formatLap(data.fastest.lap)}</span>
            <span className="font-black" style={{ color: fastestRow?.color }}>{data.fastest.driver.name_acronym}</span>
          </div>
        </div>
        <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 sm:p-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-red-300">{t.theoretical}</span>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-white">{formatLap(data.theoretical)}</span>
            {delta != null && <span className="font-mono text-sm text-emerald-300">{delta <= 0 ? "−" : "+"}{Math.abs(delta).toFixed(3)}</span>}
          </div>
          <span className="text-[11px] text-muted">{t.theoreticalNote}</span>
        </div>
      </div>

      <div className="@3xl:hidden flex justify-center">
        <SegmentedControl
          size="sm"
          className="w-full max-w-72"
          value={mobileSector}
          onChange={setMobileSector}
          ariaLabel={t.sectors}
          options={[0, 1, 2].map((i) => ({ value: String(i), label: `${t.sector} ${i + 1}` }))}
        />
      </div>

      <div className="grid gap-3 @3xl:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <SectorColumn
            key={index}
            index={index}
            rows={ranking(index)}
            label={`${t.sector} ${index + 1}`}
            hiddenOnMobile={String(index) !== mobileSector}
          />
        ))}
      </div>
    </div>
  );
}

function SectorColumn({ index, rows, label, hiddenOnMobile }: { index: number; rows: DriverSummary[]; label: string; hiddenOnMobile: boolean }) {
  const best = rows[0]?.sectors[index];
  const tint = SECTOR_TINT[index];
  return (
    <div className={`${hiddenOnMobile ? "hidden @3xl:flex" : "flex"} flex-col rounded-2xl border p-2`} style={{ borderColor: `${tint}55`, background: `linear-gradient(180deg, ${tint}1f, transparent 120px)` }}>
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-xs font-bold uppercase tracking-wider text-white">{label}</span>
        {best != null && <span className="font-mono text-xs font-bold tabular-nums" style={{ color: tint }}>{formatLap(best)}</span>}
      </div>
      <ol className="flex flex-col gap-0.5">
        {rows.map((row, i) => (
          <li
            key={row.driver.driver_number}
            className="grid grid-cols-[1.5rem_0.25rem_minmax(0,1fr)_auto] items-center gap-2 rounded-lg px-2 py-1.5 text-sm"
            style={i === 0 ? { background: `${tint}cc` } : undefined}
          >
            <span className="text-right text-xs tabular-nums text-zinc-300">{i + 1}</span>
            <span className="h-4 w-1 rounded-full" style={{ backgroundColor: row.color }} />
            <span className="font-bold tracking-wide text-white">{row.driver.name_acronym}</span>
            <span className={`font-mono text-xs tabular-nums ${i === 0 ? "font-bold text-white" : "text-zinc-300"}`}>
              {i === 0 ? formatLap(row.sectors[index]) : `+${(row.sectors[index]! - best!).toFixed(3)}`}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
