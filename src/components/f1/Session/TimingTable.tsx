"use client";

import React from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { type DriverSummary, formatLap, formatRaceTime, isQualifyingKind, isRaceKind, qualiGap, qualiStageBests, type SessionKind } from "../../../lib/openf1";
import TyreBadge from "./TyreBadge";

interface TimingTableProps {
  rows: DriverSummary[];
  kind: SessionKind | null;
  fastestLap: number | null;
}

/**
 * Classificação da sessão no estilo da transmissão/jogo de F1: sigla de 3 letras com a barra na cor
 * da equipe no celular, nome completo quando a tabela é larga; volta mais rápida em roxo.
 */
export default function TimingTable({ rows, kind, fastestLap }: TimingTableProps) {
  const { dict } = useLanguage();
  const t = dict.session;
  const quali = isQualifyingKind(kind);
  const race = isRaceKind(kind);
  const leader = rows[0];

  // Tempo de cada piloto na qualificação = o do último Q que ele disputou
  const qualiBest = (row: DriverSummary) => row.qualiTime ?? row.bestLap;
  const stageBests = quali ? qualiStageBests(rows) : [];

  const gapText = (row: DriverSummary) => {
    if (row.status) return t.status[row.status];
    if (race) {
      if (row === leader) return row.raceTime ? formatRaceTime(row.raceTime) : "";
      return typeof row.raceGap === "number" ? `+${row.raceGap.toFixed(3)}` : (row.raceGap ?? "");
    }
    if (row === leader) return "";
    if (quali && leader.qualiTime !== null) {
      // Quem caiu antes do Q3 mostra em qual Q parou (tempos de Qs diferentes não se comparam)
      const gap = qualiGap(row, leader);
      if (gap !== null) return `+${gap.toFixed(3)}`;
      return row.qualiStage !== null ? `Q${row.qualiStage + 1}` : "";
    }
    if (row.bestLap == null || leader.bestLap == null) return "";
    return `+${(row.bestLap - leader.bestLap).toFixed(3)}`;
  };

  // Colunas: pos | piloto | (Q1 Q2 Q3 | melhor volta) | diferença | voltas | pneu
  const columns = quali
    ? "grid-cols-[1.75rem_minmax(0,1fr)_5rem_4.25rem_2rem] @2xl:grid-cols-[2rem_minmax(0,1fr)_5.25rem_5.25rem_5.25rem_4.5rem_2.5rem]"
    : race
      ? "grid-cols-[1.75rem_minmax(0,1fr)_5.5rem_2.25rem_1.75rem] @2xl:grid-cols-[2rem_minmax(0,1fr)_6.5rem_5.5rem_2.5rem_2rem]"
      : "grid-cols-[1.75rem_minmax(0,1fr)_5.25rem_4.25rem_2.25rem_1.75rem] @2xl:grid-cols-[2rem_minmax(0,1fr)_6rem_5rem_3rem_2rem]";

  const header = quali ? ["Q1", "Q2", "Q3"] : [];

  return (
    <div className="@container glass rounded-3xl p-2 sm:p-3">
      <div role="table" aria-label={t.classification} className="text-sm">
        <div role="row" className={`grid ${columns} items-center gap-2 px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-muted`}>
          <span role="columnheader" className="text-center">{t.pos}</span>
          <span role="columnheader">{t.driver}</span>
          {quali ? (
            <>
              {header.map((q) => (
                <span key={q} role="columnheader" className="hidden @2xl:block text-right">{q}</span>
              ))}
              <span role="columnheader" className="@2xl:hidden text-right">{t.time}</span>
            </>
          ) : race ? (
            <>
              <span role="columnheader" className="text-right">{t.time}</span>
              <span role="columnheader" className="hidden @2xl:block text-right">{t.bestLap}</span>
            </>
          ) : (
            <span role="columnheader" className="text-right">{t.bestLap}</span>
          )}
          {!race && <span role="columnheader" className="text-right">{t.gap}</span>}
          <span role="columnheader" className="text-right">{t.laps}</span>
          {!quali && <span role="columnheader" className="text-center">{t.tyre}</span>}
        </div>

        <div role="rowgroup" className="flex flex-col gap-1">
          {rows.map((row, index) => {
            const isFastest = fastestLap != null && row.bestLap === fastestLap;
            const out = row.status != null;
            return (
              <div
                role="row"
                key={row.driver.driver_number}
                className={`reveal grid ${columns} items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-white/5 ${index % 2 === 0 ? "bg-white/[0.025]" : ""} ${out ? "opacity-60" : ""}`}
                style={{ "--i": Math.min(index, 8) + 2 } as React.CSSProperties}
              >
                <span role="cell" className="text-center font-black tabular-nums text-white">{row.position < 99 ? row.position : "–"}</span>
                <span role="cell" className="flex min-w-0 items-center gap-2">
                  <span className="h-5 w-1 shrink-0 rounded-full" style={{ backgroundColor: row.color }} />
                  <span className="font-black tracking-wide text-white @xl:hidden">{row.driver.name_acronym}</span>
                  <span className="hidden @xl:flex min-w-0 flex-col leading-tight">
                    <span className="truncate text-white">
                      {row.driver.first_name} <span className="font-bold uppercase">{row.driver.last_name}</span>
                    </span>
                    <span className="truncate text-[11px] text-muted">{row.driver.team_name}</span>
                  </span>
                </span>

                {quali ? (
                  <>
                    {[0, 1, 2].map((q) => {
                      const time = row.qualifying?.[q] ?? null;
                      const best = time !== null && time === stageBests[q];
                      return (
                        <span key={q} role="cell" className="hidden @2xl:block text-right">
                          <span className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-xs tabular-nums ${best ? "bg-purple-500/20 font-bold text-purple-300" : time === null ? "text-muted" : "text-zinc-200"}`}>
                            {formatLap(time)}
                          </span>
                        </span>
                      );
                    })}
                    <span role="cell" className="@2xl:hidden text-right font-mono text-xs tabular-nums text-white">{formatLap(qualiBest(row))}</span>
                  </>
                ) : race ? (
                  <>
                    <span role="cell" className={`text-right font-mono text-xs tabular-nums ${out ? "text-red-400 font-sans font-bold" : "text-white"}`}>{gapText(row)}</span>
                    <span role="cell" className="hidden @2xl:block text-right">
                      <LapPill time={row.bestLap} purple={isFastest} />
                    </span>
                  </>
                ) : (
                  <span role="cell" className="text-right">
                    <LapPill time={row.bestLap} purple={isFastest} />
                  </span>
                )}

                {!race && <span role="cell" className="text-right font-mono text-xs tabular-nums text-zinc-300">{gapText(row)}</span>}
                <span role="cell" className="text-right font-mono text-xs tabular-nums text-zinc-400">{row.laps || ""}</span>
                {!quali && (
                  <span role="cell" className="flex justify-center">
                    <TyreBadge compound={row.compound} className="w-6 h-6" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LapPill({ time, purple }: { time: number | null; purple: boolean }) {
  if (time == null) return <span className="font-mono text-xs text-muted">—</span>;
  return (
    <span
      className={`inline-block rounded-md px-1.5 py-0.5 font-mono text-xs font-bold tabular-nums ${purple ? "bg-purple-500/20 text-purple-300" : "bg-emerald-500/10 text-emerald-300"}`}
    >
      {formatLap(time)}
    </span>
  );
}
