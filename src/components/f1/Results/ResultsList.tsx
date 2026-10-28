"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RaceResult } from "../../../types/f1";
import { getConstructorLogo, getPositionStyle, getResultOutcome, nationalityToISO, OUTCOME_LABEL, translateStatus } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import RankFrame, { rankRowClass } from "../../ui/RankFrame";
import ResultDetailsModal from "./ResultDetailsModal";

interface ResultsListProps {
  results: RaceResult[];
  raceName: string;
}

/** Resultado de uma corrida ou sprint. Clicar numa linha abre os detalhes daquele piloto. */
export default function ResultsList({ results, raceName }: ResultsListProps) {
  const { dict, lang } = useLanguage();
  const [selected, setSelected] = useState<RaceResult | null>(null);
  const leaderLaps = Number(results[0]?.laps ?? 0);

  return (
    <>
      <RankFrame count={results.length} ariaLabel={raceName}>
        {results.map((row) => {
          // Nos anos 50 o mesmo piloto podia aparecer mais de uma vez na corrida (carro compartilhado)
          const rowId = `${row.position}-${row.Driver.driverId}`;
          const outcome = getResultOutcome(row);
          const statusText = translateStatus(row.status, lang, leaderLaps - Number(row.laps));
          const isPurpleLap = row.FastestLap?.rank === "1";

          return (
            <li key={rowId} className="min-w-0">
              <button type="button" onClick={() => setSelected(row)} className={rankRowClass}>
                <span className={`text-center ${getPositionStyle(row.position)}`}>{row.position}º</span>
                <span className="flex items-center gap-3 min-w-0">
                  <Image src={getConstructorLogo(row.Constructor.constructorId)} alt="" width={28} height={28} className="w-7 h-7 object-contain shrink-0 brightness-110" />
                  <span className="flex flex-col min-w-0 leading-tight">
                    <span className="flex items-center gap-1.5 text-sm sm:text-[15px] text-zinc-200 min-w-0">
                      <span className="truncate">
                        {row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
                      </span>
                      {isPurpleLap && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]" role="img" aria-label={dict.results.fastestLap} title={dict.results.fastestLap} />
                      )}
                    </span>
                    <span className="rank-sub flex items-center gap-1.5 text-[11px] text-muted truncate">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`} alt="" className="w-3.5 h-auto rounded-[2px] shrink-0" loading="lazy" />
                      <span className="truncate">{row.Constructor.name}</span>
                    </span>
                  </span>
                </span>
                <span className="rank-meta flex flex-col items-end leading-tight">
                  {Number(row.points) > 0 ? (
                    <span className="font-mono font-bold text-red-400 text-sm sm:text-base">+{row.points}</span>
                  ) : outcome === "classified" ? (
                    <span className="font-mono text-sm text-muted">0</span>
                  ) : (
                    <span className="text-[10px] font-black tracking-wider text-red-400 bg-red-500/10 border border-red-500/25 rounded px-1.5 py-0.5" title={statusText}>
                      {OUTCOME_LABEL[outcome]}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-muted whitespace-nowrap">{row.Time ? row.Time.time : statusText}</span>
                </span>
              </button>
            </li>
          );
        })}
      </RankFrame>

      {selected && (
        <ResultDetailsModal result={selected} leaderLaps={leaderLaps} raceName={raceName} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
