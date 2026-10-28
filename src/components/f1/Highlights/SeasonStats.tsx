"use client";

import React from "react";
import Image from "next/image";
import { computeSeasonStats, StatLeader } from "../../../lib/championship";
import { getConstructorLogo } from "../../../lib/f1-utils";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";

interface SeasonStatsProps {
  races: PastRace[];
  totalRounds: number;
}

export default function SeasonStats({ races, totalRounds }: SeasonStatsProps) {
  const { dict } = useLanguage();
  const stats = computeSeasonStats(races);
  const progress = totalRounds > 0 ? Math.min(stats.racesDone / totalRounds, 1) : 0;

  const leaders: { label: string; leader?: StatLeader; accent: string }[] = [
    { label: dict.highlights.mostWins, leader: stats.mostWins, accent: "bg-yellow-400" },
    { label: dict.highlights.mostPoles, leader: stats.mostPoles, accent: "bg-red-500" },
    { label: dict.highlights.mostPodiums, leader: stats.mostPodiums, accent: "bg-slate-300" },
    { label: dict.highlights.mostFastestLaps, leader: stats.mostFastestLaps, accent: "bg-purple-500" },
  ];

  return (
    <div className="@container h-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
      <div className="flex flex-col gap-2">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.highlights.seasonNumbers}</span>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-300">
            {dict.results.round} <span className="font-mono font-bold text-white">{stats.racesDone}</span>
            <span className="text-muted"> / {totalRounds}</span>
          </span>
          <span className="font-mono text-xs text-muted">{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden" aria-hidden="true">
          <div className="grow-x h-full rounded-full bg-red-500" style={{ width: `${progress * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
          <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted">{dict.highlights.differentWinners}</span>
          <span className="font-mono text-xl font-bold text-white">{stats.differentWinners}</span>
          <span className="ml-1.5 text-[10px] text-muted uppercase">{dict.standings.drivers}</span>
        </div>
        <div className="rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2">
          <span className="block text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted">{dict.highlights.retirements}</span>
          <span className="font-mono text-xl font-bold text-white">{stats.retirements}</span>
          <span className="ml-1.5 text-[10px] text-muted uppercase">DNF</span>
        </div>
      </div>

      <ul className="flex flex-col gap-[clamp(0.35rem,1.2vh,0.75rem)] flex-1 justify-center @2xl:grid @2xl:grid-cols-2 @2xl:gap-x-8 @2xl:content-center">
        {leaders.map(({ label, leader, accent }) =>
          leader ? (
            // Cada linha mede a própria largura: estreita = título em cima e piloto embaixo; larga = tudo numa linha
            <li key={label} className="@container min-w-0">
              <div className="flex items-center gap-3">
                <span className={`w-1.5 self-stretch min-h-5 rounded-full shrink-0 ${accent}`} />
                <div className="flex flex-1 min-w-0 flex-col gap-0.5 @min-[21rem]:flex-row @min-[21rem]:items-center @min-[21rem]:gap-3">
                  <span className="text-muted uppercase text-[10px] sm:text-[11px] font-bold tracking-wider @min-[21rem]:flex-1">{label}</span>
                  <span className="flex items-center gap-2 min-w-0 text-xs sm:text-sm">
                    <Image src={getConstructorLogo(leader.constructorId)} alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain shrink-0 brightness-110" />
                    <span className="font-bold text-white uppercase truncate">{leader.driver.familyName}</span>
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-zinc-200 bg-zinc-800 rounded px-1.5 py-0.5 shrink-0">{leader.count}</span>
              </div>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}
