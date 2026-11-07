"use client";

import React from "react";
import { type DriverSummary, formatLap, formatRaceTime, headshot, isQualifyingKind, isRaceKind, qualiGap, type SessionKind } from "../../../lib/openf1";

interface SessionPodiumProps {
  rows: DriverSummary[];
  kind: SessionKind | null;
}

/** Os três primeiros da sessão em cards com a foto do piloto na cor da equipe (2º | 1º | 3º). */
export default function SessionPodium({ rows, kind }: SessionPodiumProps) {
  const top = rows.slice(0, 3);
  if (top.length < 3) return null;
  const leader = top[0];
  const order = [top[1], top[0], top[2]];

  const detail = (row: DriverSummary) => {
    if (isRaceKind(kind)) {
      if (row === leader) return row.raceTime ? formatRaceTime(row.raceTime) : "";
      return typeof row.raceGap === "number" ? `+${row.raceGap.toFixed(3)}s` : (row.raceGap ?? "");
    }
    if (isQualifyingKind(kind) && leader.qualiTime !== null) {
      const gap = qualiGap(row, leader);
      return row === leader || gap === null ? formatLap(row.qualiTime) : `+${gap.toFixed(3)}s`;
    }
    if (row === leader || !row.bestLap || !leader.bestLap) return formatLap(row.bestLap);
    return `+${(row.bestLap - leader.bestLap).toFixed(3)}s`;
  };

  return (
    <div className="grid grid-cols-3 items-end gap-2 sm:gap-4">
      {order.map((row, index) => {
        const isFirst = row === leader;
        const photo = headshot(row.driver);
        return (
          <div
            key={row.driver.driver_number}
            className={`rise relative overflow-hidden rounded-2xl sm:rounded-3xl border ${isFirst ? "border-red-500/60" : "border-white/10"}`}
            style={{ "--i": index === 1 ? 2 : index === 0 ? 1 : 0, background: `linear-gradient(165deg, ${row.color} 0%, ${row.color}66 45%, #0b0b0e 100%)` } as React.CSSProperties}
          >
            <span className="absolute left-2.5 top-2.5 sm:left-4 sm:top-4 z-10 rounded-md bg-black/55 px-1.5 py-0.5 text-[10px] sm:text-xs font-black text-white">
              P{row.position}
            </span>
            {/* Número da posição gigante, como marca d'água */}
            <span aria-hidden="true" className="absolute -right-1 top-0 font-black italic leading-none text-white/15 text-[clamp(4rem,14vw,9rem)]">
              {row.position}
            </span>
            <div className={`relative ${isFirst ? "aspect-[4/4.6] max-h-[min(46svh,22rem)]" : "aspect-[4/4] max-h-[min(40svh,19rem)]"} flex items-end justify-center`}>
              {photo && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="" className="h-[92%] w-auto object-contain object-bottom drop-shadow-[0_8px_20px_rgba(0,0,0,0.5)]" loading="lazy" />
              )}
            </div>
            <div className="relative bg-black/55 backdrop-blur-md px-2.5 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-0.5">
              <span className="min-w-0">
                <span className="block font-black uppercase tracking-wide text-white text-xs sm:text-base truncate">{row.driver.last_name}</span>
                <span className="block text-[10px] sm:text-xs text-zinc-300 truncate">{row.driver.team_name}</span>
              </span>
              <span className="font-mono text-[11px] sm:text-sm font-bold text-white tabular-nums">{detail(row)}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
