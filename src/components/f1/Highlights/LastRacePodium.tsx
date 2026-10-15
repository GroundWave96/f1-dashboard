"use client";

import React from "react";
import Image from "next/image";
import { Driver, PastRace, RaceResult } from "../../../types/f1";
import { getConstructorLogo, getResultOutcome, nationalityToISO } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface LastRacePodiumProps {
  race: PastRace;
  onDriverClick: (driver: Driver, constructorName: string) => void;
}

const PODIUM_STYLE: Record<string, { block: string; number: string; height: string }> = {
  "1": {
    block: "border-yellow-400 bg-linear-to-b from-yellow-400/20 to-yellow-400/0",
    number: "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]",
    height: "h-20 sm:h-24",
  },
  "2": {
    block: "border-slate-300 bg-linear-to-b from-slate-300/15 to-slate-300/0",
    number: "text-slate-300",
    height: "h-14 sm:h-16",
  },
  "3": {
    block: "border-amber-600 bg-linear-to-b from-amber-600/15 to-amber-600/0",
    number: "text-amber-600",
    height: "h-10 sm:h-12",
  },
};

export default function LastRacePodium({ race, onDriverClick }: LastRacePodiumProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const results = race.Results ?? [];

  const podium = ["2", "1", "3"]
    .map((pos) => results.find((r) => r.position === pos))
    .filter((r): r is RaceResult => Boolean(r));

  const pole = results.find((r) => r.grid === "1");
  const fastest = results.find((r) => r.FastestLap?.rank === "1");
  const climber = results
    .filter((r) => getResultOutcome(r) === "classified" && Number(r.grid) > 0)
    .map((r) => ({ result: r, gain: Number(r.grid) - Number(r.position) }))
    .sort((a, b) => b.gain - a.gain)[0];

  const date = new Date(`${race.date}T${race.time || "00:00:00Z"}`).toLocaleDateString(locale, { day: "2-digit", month: "short" }).replace(".", "");

  const stats = [
    pole && {
      label: dict.highlights.pole,
      driver: pole.Driver,
      detail: null as string | null,
      accent: "bg-red-500",
    },
    fastest && {
      label: dict.highlights.fastestLap,
      driver: fastest.Driver,
      detail: fastest.FastestLap?.Time.time ?? null,
      accent: "bg-purple-500",
    },
    climber && climber.gain > 0 && {
      label: dict.highlights.biggestGain,
      driver: climber.result.Driver,
      detail: `+${climber.gain} ${dict.highlights.positions}`,
      accent: "bg-green-500",
    },
  ].filter(Boolean) as { label: string; driver: Driver; detail: string | null; accent: string }[];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-4 sm:p-6 flex flex-col gap-5">
      <div className="flex flex-col">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">
          {dict.highlights.lastRace} • {dict.results.round} {race.round} • {date}
        </span>
        <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider truncate">{race.raceName}</h3>
        <span className="text-xs text-zinc-500 truncate">{race.Circuit.circuitName}</span>
      </div>

      <div className="grid grid-cols-3 items-end gap-2 sm:gap-3">
        {podium.map((result) => {
          const style = PODIUM_STYLE[result.position];
          const gap = result.position === "1" ? result.Time?.time : result.Time?.time ?? result.status;
          return (
            <button
              key={result.Driver.driverId}
              type="button"
              onClick={() => onDriverClick(result.Driver, result.Constructor.name)}
              className="flex flex-col items-center gap-1.5 min-w-0 group cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w40/${nationalityToISO(result.Driver.nationality)}.png`}
                alt={result.Driver.nationality}
                className="w-5 h-auto rounded-sm shadow"
                loading="lazy"
              />
              <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wide truncate max-w-full group-hover:text-red-400 transition-colors">
                {result.Driver.familyName}
              </span>
              <span className="text-[10px] font-mono text-zinc-500 truncate max-w-full">{gap}</span>
              <div className={`w-full rounded-t-lg border-t-2 flex flex-col items-center justify-start pt-2 gap-1 ${style.block} ${style.height}`}>
                <span className={`font-black text-lg sm:text-2xl leading-none ${style.number}`}>{result.position}</span>
                <Image
                  src={getConstructorLogo(result.Constructor.constructorId)}
                  alt={result.Constructor.name}
                  width={22}
                  height={22}
                  className="w-5 h-5 sm:w-6 sm:h-6 object-contain brightness-110 opacity-90"
                />
              </div>
            </button>
          );
        })}
      </div>

      {stats.length > 0 && (
        <ul className="flex flex-col gap-1.5 border-t border-zinc-800/60 pt-4">
          {stats.map((stat) => (
            <li key={stat.label} className="flex items-center gap-3 text-xs sm:text-sm">
              <span className={`w-1.5 h-4 rounded-full shrink-0 ${stat.accent}`} />
              <span className="text-zinc-500 uppercase text-[10px] sm:text-[11px] font-bold tracking-wider w-32 sm:w-36 shrink-0">{stat.label}</span>
              <span className="text-zinc-300 truncate">
                {stat.driver.givenName.charAt(0)}. <span className="font-bold text-white uppercase">{stat.driver.familyName}</span>
              </span>
              {stat.detail && <span className="ml-auto font-mono text-[11px] text-zinc-400 shrink-0">{stat.detail}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
