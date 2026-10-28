"use client";

import React from "react";
import Image from "next/image";
import { apiGet } from "../../../lib/api";
import { useAsyncData } from "../../../lib/hooks";
import { getConstructorLogo, nationalityToISO } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import { TrophyIcon } from "../../ui/icons";
import Spinner from "../../ui/Spinner";

async function loadChampions() {
  const load = (season: string) =>
    Promise.all([apiGet(`${season}/driverStandings.json?limit=100`), apiGet(`${season}/constructorStandings.json?limit=100`)]);

  let [drivers, constructors] = await load("current");
  let season = drivers.StandingsTable?.season ?? String(new Date().getFullYear());

  // Virada do ano: a temporada "atual" já é a nova, ainda sem corridas. Mostra os campeões da anterior.
  if (!drivers.StandingsTable?.StandingsLists[0]) {
    season = String(Number(season) - 1);
    [drivers, constructors] = await load(season);
  }

  return {
    season,
    driver: drivers.StandingsTable?.StandingsLists[0]?.DriverStandings?.[0],
    constructor: constructors.StandingsTable?.StandingsLists[0]?.ConstructorStandings?.[0],
  };
}

export default function SeasonOver() {
  const { dict } = useLanguage();
  const { data, loading } = useAsyncData("champions", loadChampions);

  if (loading) return <Spinner />;

  const driver = data?.driver;
  const constructor = data?.constructor;

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 sm:p-10 overflow-hidden text-center animate-in fade-in duration-500">
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-48 bg-yellow-400/10 blur-3xl rounded-full pointer-events-none" />

      <TrophyIcon className="relative w-12 h-12 sm:w-14 sm:h-14 mx-auto text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.5)] mb-3" />
      <span className="relative block text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1">
        {dict.standings.season} {data?.season}
      </span>
      <h2 className="relative text-2xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-6 sm:mb-8">
        {dict.nextRace.seasonOver}
      </h2>

      {(driver || constructor) && (
        <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 text-left">
          {driver && (
            <div className="bg-zinc-950/50 border border-yellow-400/20 rounded-xl p-4 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w80/${nationalityToISO(driver.Driver.nationality)}.png`}
                alt={driver.Driver.nationality}
                className="w-10 h-auto rounded shadow"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">{dict.nextRace.driverChampion}</span>
                <span className="text-xs text-zinc-400 truncate">{driver.Driver.givenName}</span>
                <span className="text-white text-base sm:text-lg font-black uppercase leading-tight truncate">{driver.Driver.familyName}</span>
                <span className="text-xs text-muted font-mono">
                  {driver.points} {dict.standings.pts.toLowerCase()} • {driver.wins} {dict.standings.wins.toLowerCase()}
                </span>
              </div>
            </div>
          )}
          {constructor && (
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-4 flex items-center gap-4">
              <Image
                src={getConstructorLogo(constructor.Constructor.constructorId)}
                alt={constructor.Constructor.name}
                width={40}
                height={40}
                className="w-10 h-10 object-contain brightness-110"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{dict.nextRace.constructorChampion}</span>
                <span className="text-white text-base sm:text-lg font-black uppercase truncate">{constructor.Constructor.name}</span>
                <span className="text-xs text-muted font-mono">
                  {constructor.points} {dict.standings.pts.toLowerCase()} • {constructor.wins} {dict.standings.wins.toLowerCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <p className="relative text-muted text-xs sm:text-sm max-w-md mx-auto">{dict.nextRace.nextSeasonSoon}</p>
    </div>
  );
}
