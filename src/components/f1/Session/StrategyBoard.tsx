"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { decimal, fill } from "../../../i18n/format";
import { type DriverSummary, isRaceKind, type OF1Pit, type OF1Stint, type SessionData, type SessionKind } from "../../../lib/openf1";
import BlockCard from "./BlockCard";
import { TYRES } from "./TyreBadge";

const COMPOUND_ORDER = ["SOFT", "MEDIUM", "HARD", "INTERMEDIATE", "WET"];
// Texto escuro nas cores claras (médio, duro, intermediário); branco nas escuras
const DARK_TEXT = new Set(["MEDIUM", "HARD", "INTERMEDIATE"]);
// Listras = pneu já usado antes
const USED_STRIPES = "repeating-linear-gradient(135deg, rgba(0,0,0,0.38) 0 3px, transparent 3px 7px)";
// Paradas anormais (ex.: troca de bico, problema na roda) distorcem a "parada mais rápida"
const MIN_REAL_STOP = 1.5;

interface Stint {
  compound: string;
  from: number;
  to: number;
  age: number;
}

interface StrategyRow {
  row: DriverSummary;
  stints: Stint[];
  pits: OF1Pit[];
}

/**
 * Estratégia de pneus: uma régua por piloto, das primeiras às últimas voltas, pintada com a cor de
 * cada pneu. Na corrida, as trocas de cor são as paradas no box. Tocar num piloto abre os detalhes
 * (cada pneu e cada parada) logo abaixo da linha dele, no celular e no computador.
 */
export default function StrategyBoard({ data, pits, kind, className }: { data: SessionData; pits: OF1Pit[]; kind: SessionKind | null; className?: string }) {
  const { dict, lang } = useLanguage();
  const t = dict.session.strategy;
  const race = isRaceKind(kind);
  const [selected, setSelected] = useState<number | null>(null);

  const strategy = useMemo(() => buildStrategy(data, race ? pits : []), [data, pits, race]);
  if (!strategy.rows.length) return null;
  const { rows, totalLaps } = strategy;

  const tyreName = (compound: string) => dict.session.tyres[compound as keyof typeof dict.session.tyres] ?? compound;
  const compounds = COMPOUND_ORDER.filter((c) => rows.some((r) => r.stints.some((s) => s.compound === c)));
  const anyUsed = rows.some((r) => r.stints.some((s) => s.age > 0));

  // Resumo: na corrida, quantas paradas fez a maioria e a parada mais rápida; nos treinos, o pneu mais usado
  let summary: string;
  if (race) {
    const finishers = rows.filter((r) => !r.row.status);
    const counts = new Map<number, number>();
    for (const r of finishers.length ? finishers : rows) counts.set(r.pits.length, (counts.get(r.pits.length) ?? 0) + 1);
    const mostCommon = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? 0;
    const stopsText = mostCommon === 0 ? t.noStops : mostCommon === 1 ? t.mostStopsOne : fill(t.mostStops, { n: mostCommon });
    const fastest = rows
      .flatMap((r) => r.pits.map((pit) => ({ pit, row: r.row })))
      .filter(({ pit }) => pit.stop_duration !== null && pit.stop_duration >= MIN_REAL_STOP)
      .sort((a, b) => a.pit.stop_duration! - b.pit.stop_duration!)[0];
    summary = fastest
      ? `${stopsText} · ${fill(t.fastestStop, { time: decimal(fastest.pit.stop_duration!, lang), team: fastest.row.driver.team_name ?? "", driver: fastest.row.driver.last_name, lap: fastest.pit.lap_number })}`
      : stopsText;
  } else {
    const lapsBy = new Map<string, number>();
    for (const r of rows) for (const s of r.stints) lapsBy.set(s.compound, (lapsBy.get(s.compound) ?? 0) + (s.to - s.from + 1));
    const total = [...lapsBy.values()].reduce((a, b) => a + b, 0);
    const [top] = [...lapsBy.entries()].sort((a, b) => b[1] - a[1]);
    summary = top && total ? fill(t.mostUsed, { tyre: tyreName(top[0]), pct: Math.round((top[1] / total) * 100) }) : "";
  }

  // Marcas do eixo das voltas: 1, a cada 10 (ou 5 em sessões curtas) e a última
  const step = totalLaps > 40 ? 10 : 5;
  const ticks = [1, ...Array.from({ length: Math.floor(totalLaps / step) }, (_, i) => (i + 1) * step).filter((lap) => lap < totalLaps - step / 3), totalLaps];
  const pct = (lap: number) => ((lap - 1) / totalLaps) * 100;

  return (
    <BlockCard className={className} title={race ? t.title : t.titlePractice} summary={summary} info={race ? t.info : t.infoPractice}>
      {/* Legenda */}
      <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-zinc-300">
        {compounds.map((compound) => (
          <li key={compound} className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm" style={{ backgroundColor: TYRES[compound]?.color }} />
            {tyreName(compound)}
          </li>
        ))}
        {anyUsed && (
          <li className="flex items-center gap-1.5">
            <span className="h-3 w-5 rounded-sm bg-zinc-400" style={{ backgroundImage: USED_STRIPES }} />
            {t.used}
          </li>
        )}
      </ul>

      <div className="flex flex-col gap-1">
        {rows.map(({ row, stints, pits: driverPits }) => {
          const isOpen = selected === row.driver.driver_number;
          const lastLap = stints[stints.length - 1]?.to ?? 0;
          return (
            <div key={row.driver.driver_number} className="flex flex-col">
              <button
                type="button"
                onClick={() => setSelected(isOpen ? null : row.driver.driver_number)}
                aria-expanded={isOpen}
                className={`tap grid grid-cols-[2.6rem_minmax(0,1fr)] items-center gap-2 rounded-lg px-1.5 py-1 text-left transition-colors duration-150 ${isOpen ? "bg-white/10" : "hover:bg-white/5"}`}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-4 w-1 rounded-full" style={{ backgroundColor: row.color }} />
                  <span className="text-xs font-black tracking-wide text-white">{row.driver.name_acronym}</span>
                </span>
                <span className="relative h-5 rounded-md bg-white/[0.04]">
                  {stints.map((stint, index) => {
                    const laps = stint.to - stint.from + 1;
                    const color = TYRES[stint.compound]?.color ?? "#71717a";
                    const showLabel = laps / totalLaps >= 0.07;
                    return (
                      <span
                        key={index}
                        className="grow-x absolute inset-y-0 flex items-center justify-center overflow-hidden rounded-[5px] text-[10px] font-bold tabular-nums"
                        style={{
                          left: `calc(${pct(stint.from)}% + 1px)`,
                          width: `calc(${(laps / totalLaps) * 100}% - 2px)`,
                          backgroundColor: color,
                          backgroundImage: stint.age > 0 ? USED_STRIPES : undefined,
                          color: DARK_TEXT.has(stint.compound) ? "#18181b" : "#fff",
                          "--i": Math.min(index, 6),
                        } as React.CSSProperties}
                      >
                        {showLabel && laps}
                      </span>
                    );
                  })}
                  {row.status && lastLap < totalLaps && (
                    <span className="absolute top-1/2 -translate-y-1/2 pl-1 text-[10px] font-bold uppercase text-red-400" style={{ left: `${(lastLap / totalLaps) * 100}%` }}>
                      {dict.session.status[row.status]}
                    </span>
                  )}
                </span>
              </button>

              {isOpen && (
                <div className="swap-in ml-[3.1rem] mt-1 mb-2 flex flex-col gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-xs text-zinc-300">
                  {stints.map((stint, index) => {
                    // Parada que encerrou este pneu (a volta da parada é a última do stint ou a seguinte)
                    const pit = index < stints.length - 1 ? driverPits.find((p) => p.lap_number >= stint.to && p.lap_number <= stint.to + 1) : undefined;
                    return (
                    <React.Fragment key={index}>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: TYRES[stint.compound]?.color }} />
                        <span>
                          {fill(t.stint, { tyre: tyreName(stint.compound), from: stint.from, to: stint.to, n: stint.to - stint.from + 1 })}
                          {stint.age > 0 && <span className="text-muted"> · {fill(t.usedAge, { n: stint.age })}</span>}
                        </span>
                      </span>
                      {pit && (
                        <span className="flex items-center gap-2 pl-[1.125rem] text-muted">
                          <svg className="h-3 w-3 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                            <path d="M12 5v14M6 13l6 6 6-6" />
                          </svg>
                          {pit.stop_duration !== null
                            ? fill(t.pitAt, { lap: pit.lap_number, stop: decimal(pit.stop_duration, lang), lane: decimal(pit.lane_duration ?? 0, lang) })
                            : fill(t.pitAtNoStop, { lap: pit.lap_number, lane: decimal(pit.lane_duration ?? 0, lang) })}
                        </span>
                      )}
                    </React.Fragment>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Eixo das voltas, alinhado com as réguas */}
      <div className="grid grid-cols-[2.6rem_minmax(0,1fr)] gap-2 px-1.5" aria-hidden="true">
        <span className="text-[10px] font-bold uppercase text-muted">{t.lap}</span>
        <span className="relative h-3">
          {ticks.map((lap) => (
            <span
              key={lap}
              className="absolute top-0 font-mono text-[10px] text-muted"
              style={lap === totalLaps ? { right: 0 } : lap === 1 ? { left: 0 } : { left: `${pct(lap) + 100 / totalLaps / 2}%`, transform: "translateX(-50%)" }}
            >
              {lap}
            </span>
          ))}
        </span>
      </div>

      <p className="text-[11px] text-muted">{t.tapHint}</p>
    </BlockCard>
  );
}

function buildStrategy(data: SessionData, pits: OF1Pit[]) {
  const stintsBy = new Map<number, OF1Stint[]>();
  for (const stint of data.stints) {
    if (!stint.compound || stint.lap_start == null) continue;
    const list = stintsBy.get(stint.driver_number) ?? [];
    list.push(stint);
    stintsBy.set(stint.driver_number, list);
  }
  const lapsBy = new Map<number, number>();
  for (const lap of data.laps) lapsBy.set(lap.driver_number, Math.max(lapsBy.get(lap.driver_number) ?? 0, lap.lap_number));

  const rows: StrategyRow[] = [];
  for (const row of data.rows) {
    const raw = (stintsBy.get(row.driver.driver_number) ?? []).sort((a, b) => a.stint_number - b.stint_number);
    if (!raw.length) continue;
    const lastLap = Math.max(lapsBy.get(row.driver.driver_number) ?? 0, row.laps, ...raw.map((s) => s.lap_end ?? 0));
    const stints = raw
      .map((s, i) => ({
        compound: s.compound!,
        from: s.lap_start!,
        // Último stint sem fim informado: vai até a última volta do piloto
        to: s.lap_end ?? (i === raw.length - 1 ? lastLap : (raw[i + 1].lap_start ?? lastLap) - 1),
        age: s.tyre_age_at_start ?? 0,
      }))
      .filter((s) => s.to >= s.from);
    if (!stints.length) continue;
    const driverPits = pits
      .filter((pit) => pit.driver_number === row.driver.driver_number && pit.lap_number > 1)
      .sort((a, b) => a.lap_number - b.lap_number);
    rows.push({ row, stints, pits: driverPits });
  }
  const totalLaps = Math.max(1, ...rows.map((r) => r.stints[r.stints.length - 1].to));
  return { rows, totalLaps };
}
