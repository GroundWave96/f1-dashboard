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
import SeasonStats from "./SeasonStats";
import CardDeck from "../../ui/CardDeck";
import SectionHeader from "../../ui/SectionHeader";
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
    races,
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
        <span className="text-muted text-xs text-center px-4 mb-2">{dict.errors.highlightsMsg}</span>
        <button onClick={reload} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors">
          {dict.errors.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="shell h-full flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
      <SectionHeader eyebrow={dict.highlights.title} title={`${dict.highlights.heading} ${data.season}`} />

      {data.lastRace ? (
        <CardDeck labels={[dict.highlights.lastRace, dict.highlights.titleFight, dict.highlights.seasonNumbers]}>
          {[
            <LastRacePodium
              key="podium"
              race={data.lastRace}
              onDriverClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
            />,
            <TitleFight
              key="title"
              season={data.season}
              calendar={data.calendar}
              standingsRound={data.standingsRound}
              drivers={data.drivers}
              constructors={data.constructors}
              now={now}
            />,
            <SeasonStats key="stats" races={data.races} totalRounds={data.calendar.length} />,
          ]}
        </CardDeck>
      ) : (
        <div className="flex-1 flex items-center justify-center text-muted text-sm text-center px-4">
          {dict.highlights.noData}
        </div>
      )}

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
