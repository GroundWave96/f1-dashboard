"use client";

import React from "react";
import Image from "next/image";
import { QualifyingResult } from "../../../types/f1";
import { getConstructorLogo, getPositionStyle, nationalityToISO } from "../../../lib/f1-utils";
import { parseLapTime } from "../../../lib/championship";
import { useLanguage } from "../../../i18n/LanguageContext";
import RankFrame from "../../ui/RankFrame";

const SEGMENTS = ["Q1", "Q2", "Q3"] as const;

/**
 * Qualificação. Em colunas largas mostra Q1/Q2/Q3 (melhor tempo de cada fase em roxo);
 * em colunas estreitas, só o melhor tempo e a diferença para a pole (container query).
 */
export default function QualifyingList({ results }: { results: QualifyingResult[] }) {
  const { dict } = useLanguage();

  const bestTime = (r: QualifyingResult) => r.Q3 || r.Q2 || r.Q1;
  const poleMs = parseLapTime(bestTime(results[0]));

  const fastestBySegment = Object.fromEntries(
    SEGMENTS.map((segment) => {
      const times = results.map((r) => parseLapTime(r[segment])).filter((t): t is number => t !== null);
      return [segment, times.length ? Math.min(...times) : null];
    })
  );

  const formatGap = (r: QualifyingResult) => {
    const ms = parseLapTime(bestTime(r));
    if (ms === null || poleMs === null) return "—";
    if (ms === poleMs) return "Pole";
    return `+${((ms - poleMs) / 1000).toFixed(3)}`;
  };

  return (
    <RankFrame count={results.length} ariaLabel={dict.results.qualiSession}>
      {results.map((row) => (
        <li key={`${row.position}-${row.Driver.driverId}`} className="@container min-w-0">
          <div className="grid grid-cols-[2.25rem_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2.5 sm:px-3 py-[clamp(0.3rem,0.95vh,0.8rem)] hover:bg-zinc-800/40 transition-colors">
            <span className={`text-center ${getPositionStyle(row.position)}`}>{row.position}º</span>
            <span className="flex items-center gap-3 min-w-0">
              <Image src={getConstructorLogo(row.Constructor.constructorId)} alt="" width={28} height={28} className="w-7 h-7 object-contain shrink-0 brightness-110" />
              <span className="flex flex-col min-w-0 leading-tight">
                <span className="text-sm sm:text-[15px] text-zinc-200 truncate">
                  <span className="hidden @xl:inline">{row.Driver.givenName} </span>
                  <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
                </span>
                <span className="rank-sub flex items-center gap-1.5 text-[11px] text-muted truncate">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`} alt="" className="w-3.5 h-auto rounded-[2px] shrink-0" loading="lazy" />
                  <span className="truncate">{row.Constructor.name}</span>
                </span>
              </span>
            </span>

            <span className="flex items-center gap-3">
              {/* Colunas Q1/Q2/Q3: só quando a linha é larga o bastante */}
              {SEGMENTS.map((segment) => {
                const isFastest = row[segment] && parseLapTime(row[segment]) === fastestBySegment[segment];
                return (
                  <span
                    key={segment}
                    className={`hidden @lg:flex flex-col items-end font-mono text-xs w-16 ${isFastest ? "text-purple-400 font-bold" : row[segment] ? "text-zinc-300" : "text-zinc-700"}`}
                  >
                    <span className="text-[9px] font-sans font-bold text-muted">{segment}</span>
                    {row[segment] || "—"}
                  </span>
                );
              })}
              <span className="flex flex-col items-end leading-tight min-w-[4.25rem]">
                <span className="@lg:hidden font-mono text-xs text-zinc-200">{bestTime(row) || "—"}</span>
                <span className={`font-mono text-[11px] ${formatGap(row) === "Pole" ? "text-yellow-400 font-bold" : "text-muted"}`}>{formatGap(row)}</span>
              </span>
            </span>
          </div>
        </li>
      ))}
    </RankFrame>
  );
}
