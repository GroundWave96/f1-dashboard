"use client";

import React, { useEffect, useRef, useState } from "react";
import { apiGet, apiGetAllRaces } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { getRaceSessions, getRaceStart, isWeekendActive, isWeekendOver } from "../../../lib/sessions";
import { useLanguage } from "../../../i18n/LanguageContext";
import { countryToISO } from "../../../lib/f1-utils";
import { Race } from "../../../types/f1";
import Spinner from "../../ui/Spinner";
import SectionHeader from "../../ui/SectionHeader";
import { ErrorIcon, TrophyIcon } from "../../ui/icons";
import RaceDetailsModal from "./RaceDetailsModal";

async function loadCalendar() {
  const data = await apiGet("current.json");
  return data.RaceTable?.Races ?? [];
}

async function loadWinners() {
  const races = await apiGetAllRaces("current", "results");
  return new Map(races.map((race) => [race.round, race.Results?.[0]?.Driver]));
}

// "Mexico City Grand Prix" -> "Mexico City" (o card já diz que é um GP)
const shortRaceName = (name: string) => name.replace(/\s*Grand Prix\s*/i, " ").replace(/\s+/g, " ").trim();

export default function CalendarSection() {
  const [selected, setSelected] = useState<Race | null>(null);
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const now = useNow(60_000);
  const listRef = useRef<HTMLOListElement>(null);

  const calendar = useAsyncData("calendar:current", loadCalendar);
  const { data: winners } = useAsyncData("winners:current", loadWinners);
  const races = calendar.data ?? [];
  const season = races[0]?.season ?? "";
  const nextRound = races.find((race) => !isWeekendOver(race, now))?.round;

  // No celular (lista com rolagem), já abre mostrando a próxima corrida
  useEffect(() => {
    const list = listRef.current;
    if (!list || !nextRound || list.scrollHeight <= list.clientHeight) return;
    const item = list.querySelector<HTMLElement>(`[data-round="${nextRound}"]`);
    if (item) list.scrollTop = item.offsetTop - list.clientHeight / 3;
  }, [nextRound, races.length]);

  const formatDay = (date: Date) =>
    date.toLocaleDateString(locale, { day: "numeric", month: "short" }).replace(" de ", " ").replace(".", "");

  const dateRange = (race: Race) => {
    const first = getRaceSessions(race)[0]?.start ?? getRaceStart(race);
    const end = getRaceStart(race);
    return first.toDateString() === end.toDateString() ? formatDay(end) : `${formatDay(first)} – ${formatDay(end)}`;
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
        <button onClick={calendar.reload} className="mt-2 px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-[background-color,scale] duration-150 motion-safe:active:scale-[0.96]">
          {dict.errors.tryAgain}
        </button>
      </div>
    );
  }

  return (
    <div className="shell h-full flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
      <SectionHeader eyebrow={dict.calendar.title} title={season} />

      {/* Celular: lista com rolagem. A partir de 640px: grade de cards que preenche a altura da tela. */}
      <ol ref={listRef} className="cal-grid flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar">
        {races.map((race, index) => {
          const isLive = isWeekendActive(race, now);
          const isDone = isWeekendOver(race, now);
          const isNext = race.round === nextRound && !isLive;
          const winner = isDone ? winners?.get(race.round) : undefined;

          const tone = isLive
            ? "border-red-500/70 bg-red-500/10 shadow-[0_0_18px_rgba(239,68,68,0.18)]"
            : isNext
              ? "border-red-500/45 bg-zinc-900 shadow-[0_0_18px_rgba(239,68,68,0.12)]"
              : isDone
                ? "border-zinc-800/70 bg-zinc-900/60"
                : "border-zinc-800 bg-zinc-900";

          const status = isLive ? dict.calendar.thisWeekend : isNext ? dict.calendar.next : null;

          return (
            <li key={race.round} data-round={race.round} className="reveal min-w-0" style={{ "--i": Math.floor(index / 4) + 1 } as React.CSSProperties}>
              <button
                type="button"
                onClick={() => setSelected(race)}
                className={`group relative h-full w-full rounded-xl border p-3 text-left transition-[translate,background-color,border-color] duration-200 ease-fluid motion-safe:hover:-translate-y-0.5 hover:border-zinc-600 flex items-center gap-3 sm:flex-col sm:items-stretch sm:justify-between sm:gap-1.5 ${tone}`}
              >
                <div className="flex items-center gap-2 shrink-0 sm:justify-between">
                  <span className={`font-mono text-xs font-bold ${isLive || isNext ? "text-red-500" : isDone ? "text-muted" : "text-zinc-400"}`}>
                    R{race.round.padStart(2, "0")}
                  </span>
                  <span className="hidden sm:flex items-center gap-1.5">
                    {race.Sprint && (
                      <span className="text-[8px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 rounded px-1 py-px">{dict.nextRace.sprint}</span>
                    )}
                    {status && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />
                        {status}
                      </span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 min-w-0 flex-1 sm:flex-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w40/${countryToISO(race.Circuit.Location.country)}.png`}
                    alt=""
                    className={`w-6 h-auto rounded-sm shadow-sm shrink-0 ${isDone ? "opacity-60" : ""}`}
                    loading="lazy"
                  />
                  <span className="flex flex-col min-w-0 leading-tight">
                    <span className={`font-bold uppercase tracking-wide text-sm truncate ${isDone ? "text-zinc-400" : "text-white"}`}>
                      {shortRaceName(race.raceName)}
                    </span>
                    <span className="sm:hidden text-[11px] text-muted truncate">{dateRange(race)}</span>
                  </span>
                </div>

                <div className="flex items-center justify-end sm:justify-between gap-2 text-[11px] shrink-0">
                  <span className="hidden sm:inline text-muted font-mono">{dateRange(race)}</span>
                  {winner ? (
                    <span className="flex items-center gap-1 text-zinc-300 min-w-0" title={`${dict.calendar.winner}: ${winner.givenName} ${winner.familyName}`}>
                      <TrophyIcon className="w-3.5 h-3.5 text-yellow-500/80 shrink-0" />
                      <span className="font-bold uppercase truncate">{winner.familyName}</span>
                    </span>
                  ) : status ? (
                    <span className="sm:hidden flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />
                      {status}
                    </span>
                  ) : race.Sprint ? (
                    <span className="sm:hidden text-[8px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 rounded px-1 py-px">{dict.nextRace.sprint}</span>
                  ) : null}
                </div>
              </button>
            </li>
          );
        })}
      </ol>

      {selected && (
        <RaceDetailsModal race={selected} winner={isWeekendOver(selected, now) ? winners?.get(selected.round) : undefined} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
