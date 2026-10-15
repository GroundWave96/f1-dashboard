"use client";

import React, { useState } from "react";
import { apiGet, apiGetAllRaces } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { Driver } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";
import LastRacePodium from "./LastRacePodium";
import TitleFight from "./TitleFight";
import DriverModal from "../Standings/DriverModal";

async function loadSeason(seasonKey: string) {
  const [calendar, drivers, constructors, races] = await Promise.all([
    apiGet(`${seasonKey}.json`),
    apiGet(`${seasonKey}/driverStandings.json?limit=100`),
    apiGet(`${seasonKey}/constructorStandings.json?limit=100`),
    apiGetAllRaces(seasonKey, "results"),
  ]);
  const list = drivers.StandingsTable?.StandingsLists[0];
  return {
    season: drivers.StandingsTable?.season ?? calendar.RaceTable?.season ?? seasonKey,
    calendar: calendar.RaceTable?.Races ?? [],
    standingsRound: Number(list?.round ?? 0),
    drivers: list?.DriverStandings ?? [],
    constructors: constructors.StandingsTable?.StandingsLists[0]?.ConstructorStandings ?? [],
    lastRace: races[races.length - 1],
  };
}

async function loadHighlights() {
  const current = await loadSeason("current");
  if (current.lastRace) return current;
  // Temporada nova ainda sem corridas: mostra o resumo da anterior até a primeira largada
  const previous = await loadSeason(String(Number(current.season) - 1));
  return previous.lastRace ? previous : current;
}

export default function HighlightsSection() {
  const { dict } = useLanguage();
  const now = useNow(60_000);
  const { data, loading, error, reload } = useAsyncData("highlights", loadHighlights);
  const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver; constructorName: string } | null>(null);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
        <Spinner />
        <span>{dict.highlights.loading}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
        <ErrorIcon className="w-12 h-12 mb-2 opacity-50" />
        <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
        <span className="text-zinc-500 text-xs text-center px-4 mb-2">{dict.errors.highlightsMsg}</span>
        <button onClick={reload} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors">
          {dict.errors.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-2 flex flex-col h-full py-4 sm:py-6">
      <div className="flex flex-col mb-4 sm:mb-6 shrink-0 text-center sm:text-left">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.highlights.title}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
          {dict.highlights.heading} {data.season}
        </h2>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar pr-1 pb-4 flex flex-col">
        {data.lastRace ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:my-auto animate-in fade-in duration-500">
            <LastRacePodium
              race={data.lastRace}
              onDriverClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
            />
            <TitleFight
              season={data.season}
              calendar={data.calendar}
              standingsRound={data.standingsRound}
              drivers={data.drivers}
              constructors={data.constructors}
              now={now}
            />
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-500 text-sm text-center px-4">
            {dict.highlights.noData}
          </div>
        )}
      </div>

      {selectedDriver && (
        <DriverModal
          driver={selectedDriver.driver}
          constructorName={selectedDriver.constructorName}
          onClose={() => setSelectedDriver(null)}
        />
      )}
    </div>
  );
}
