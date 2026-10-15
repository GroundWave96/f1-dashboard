"use client";

import React from "react";
import { Constructor } from "../../../types/f1";
import { apiGetAllRaces } from "../../../lib/api";
import { computeTeammateDuel } from "../../../lib/championship";
import { useAsyncData } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";

interface TeammateDuelProps {
  constructorData: Constructor;
  season: string;
}

async function loadDuel(season: string, constructorData: Constructor) {
  const [races, sprints, qualifying] = await Promise.all([
    apiGetAllRaces(season, "results"),
    apiGetAllRaces(season, "sprint"),
    apiGetAllRaces(season, "qualifying"),
  ]);
  return {
    seasonYear: races[0]?.season ?? season,
    duel: computeTeammateDuel(races, sprints, qualifying, constructorData),
  };
}

export default function TeammateDuel({ constructorData, season }: TeammateDuelProps) {
  const { dict } = useLanguage();
  const { data, loading } = useAsyncData(`duel:${season}:${constructorData.constructorId}`, () => loadDuel(season, constructorData));

  if (loading) {
    return <div className="w-full h-40 mb-5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 animate-pulse" />;
  }

  const duel = data?.duel;
  if (!duel) return null;

  const [a, b] = duel.drivers;
  const rows = [
    { label: dict.driverModal.duelQuali, values: duel.quali },
    { label: dict.driverModal.duelRace, values: duel.race },
    { label: dict.driverModal.duelPoints, values: duel.points },
  ].filter((row) => row.values[0] + row.values[1] > 0);

  return (
    <div className="w-full bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-4 mb-5 text-left">
      <div className="flex justify-between items-center mb-3">
        <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{dict.driverModal.teammateDuel}</span>
        <span className="text-[10px] text-zinc-600 font-mono">{data.seasonYear}</span>
      </div>

      <div className="flex justify-between items-center mb-3 gap-3">
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
          <span className="text-sm font-bold text-white uppercase truncate">{a.familyName}</span>
        </span>
        <span className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-bold text-white uppercase truncate">{b.familyName}</span>
          <span className="w-2 h-2 rounded-full bg-zinc-300 shrink-0" />
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const [va, vb] = row.values;
          const share = (va / (va + vb)) * 100;
          return (
            <div key={row.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={`font-mono ${va > vb ? "text-white font-bold" : "text-zinc-400"}`}>{va}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">{row.label}</span>
                <span className={`font-mono ${vb > va ? "text-white font-bold" : "text-zinc-400"}`}>{vb}</span>
              </div>
              <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5" aria-hidden="true">
                <div className="bg-red-500 rounded-l-full" style={{ width: `${share}%` }} />
                <div className="bg-zinc-300 rounded-r-full flex-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
