"use client";

import React, { useState } from "react";
import { apiGet, apiGetAllRaces } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { getRaceSessions, isWeekendActive, isWeekendOver } from "../../../lib/sessions";
import { useLanguage } from "../../../i18n/LanguageContext";
import { countryToISO } from "../../../lib/f1-utils";
import Spinner from "../../ui/Spinner";
import { ErrorIcon, TrophyIcon } from "../../ui/icons";

async function loadCalendar() {
  const data = await apiGet("current.json");
  return data.RaceTable?.Races ?? [];
}

async function loadWinners() {
  const races = await apiGetAllRaces("current", "results");
  return new Map(races.map((race) => [race.round, race.Results?.[0]?.Driver]));
}

export default function CalendarSection() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const now = useNow(60_000);

  const calendar = useAsyncData("calendar:current", loadCalendar);
  const { data: winners } = useAsyncData("winners:current", loadWinners);
  const races = calendar.data ?? [];
  const season = races[0]?.season ?? "";
  const nextRound = races.find((race) => !isWeekendOver(race, now))?.round;

  const toggleExpand = (roundId: string) => {
    setExpandedId((prev) => (prev === roundId ? null : roundId));
  };

  const formatDateTime = (date: Date) => {
    const day = date.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" }).replace(".", "");
    const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${dict.nextRace.at} ${time}`;
  };

  if (calendar.loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 gap-4 h-full">
        <Spinner />
      </div>
    );
  }

  if (calendar.error) {
    return (
      <div className="flex flex-col items-center justify-center text-red-500 gap-2 h-full">
        <ErrorIcon className="w-12 h-12 mb-2 opacity-50" />
        <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
        <button onClick={calendar.reload} className="mt-2 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors">
          {dict.errors.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col h-full py-4 sm:py-6">
      <div className="flex flex-col mb-4 sm:mb-6 shrink-0 text-center sm:text-left">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.calendar.title}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">{season}</h2>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain rounded-xl custom-scrollbar pr-2 pb-16 lg:pb-0">
        <div className="flex flex-col gap-3">
          {races.map((race) => {
            const isExpanded = expandedId === race.round;
            const isLive = isWeekendActive(race, now);
            const isDone = isWeekendOver(race, now);
            const isNext = race.round === nextRound && !isLive;
            const winner = isDone ? winners?.get(race.round) : undefined;
            const sessions = getRaceSessions(race);

            const roundColor = isLive || isNext ? "text-red-500" : isDone ? "text-zinc-600" : "text-zinc-400";

            return (
              <div
                key={race.round}
                className={`bg-zinc-900 border rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out ${isLive ? "border-red-500/50" : "border-zinc-800"}`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(race.round)}
                  aria-expanded={isExpanded}
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`font-mono font-bold text-sm sm:text-base w-6 text-left shrink-0 ${roundColor}`}>
                      {race.round.padStart(2, "0")}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://flagcdn.com/w40/${countryToISO(race.Circuit.Location.country)}.png`}
                      alt={race.Circuit.Location.country}
                      className={`w-6 h-auto rounded-sm shadow-sm shrink-0 ${isDone ? "opacity-60" : ""}`}
                      loading="lazy"
                    />
                    <div className="flex flex-col text-left min-w-0">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`font-bold uppercase tracking-wide text-sm sm:text-base truncate ${isDone ? "text-zinc-400" : "text-white"}`}>
                          {race.raceName}
                        </span>
                        {race.Sprint && (
                          <span className="hidden sm:inline text-[8px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 rounded px-1 py-px shrink-0">
                            {dict.nextRace.sprint}
                          </span>
                        )}
                      </span>
                      {/* No celular o vencedor ocupa a linha do circuito, para não espremer o nome do GP */}
                      {winner && (
                        <span className="sm:hidden flex items-center gap-1 text-[10px] uppercase tracking-wider text-zinc-400 min-w-0">
                          <TrophyIcon className="w-3 h-3 text-yellow-500/80 shrink-0" />
                          <span className="font-bold truncate">{winner.familyName}</span>
                        </span>
                      )}
                      <span className={`text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider truncate ${winner ? "hidden sm:block" : ""}`}>
                        {race.Circuit.circuitName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {winner ? (
                      <span className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400" title={`${dict.calendar.winner}: ${winner.givenName} ${winner.familyName}`}>
                        <TrophyIcon className="w-3.5 h-3.5 text-yellow-500/80" />
                        <span className="font-bold uppercase tracking-wide">{winner.familyName}</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${isLive || isNext ? "bg-red-500 animate-pulse" : isDone ? "bg-zinc-600" : "bg-zinc-400"}`}
                        />
                        <span
                          className={`hidden sm:inline text-[10px] uppercase tracking-widest ${isLive || isNext ? "text-red-500 font-bold" : isDone ? "text-zinc-500" : "text-zinc-400"}`}
                        >
                          {isLive ? dict.calendar.thisWeekend : isNext ? dict.calendar.next : isDone ? dict.calendar.completed : dict.calendar.upcoming}
                        </span>
                      </div>
                    )}
                    <svg className={`w-5 h-5 text-zinc-500 transform transition-transform duration-300 ${isExpanded ? "rotate-180 text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                <div className={`transition-all duration-300 ease-in-out bg-zinc-950/50 ${isExpanded ? "max-h-96 opacity-100 border-t border-zinc-800" : "max-h-0 opacity-0"}`}>
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    {sessions.map((session) =>
                      session.key === "race" ? (
                        <div key={session.key} className="flex justify-between sm:col-span-2 bg-red-950/20 border border-red-900/30 rounded p-3 mt-1">
                          <span className="text-sm text-red-500 font-black uppercase tracking-widest">{dict.sessions.race}</span>
                          <span className="text-sm text-white font-mono font-bold">{formatDateTime(session.start)}</span>
                        </div>
                      ) : (
                        <div key={session.key} className="flex justify-between gap-3 border-b border-zinc-800/50 pb-2">
                          <span className={`text-xs font-bold uppercase tracking-wider ${session.key === "qualifying" ? "text-red-400" : "text-zinc-400"}`}>
                            {dict.sessions[session.key]}
                          </span>
                          <span className="text-xs text-zinc-200 font-mono">{formatDateTime(session.start)}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
