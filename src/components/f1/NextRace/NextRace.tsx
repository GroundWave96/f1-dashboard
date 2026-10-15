"use client";

import React from "react";
import { apiGet } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { getRaceSessions, getWeekendState, isWeekendOver, RaceSession, WeekendState } from "../../../lib/sessions";
import RaceInfo from "./RaceInfo";
import CountdownTimer from "./CountdownTimer";
import TrackMap from "./TrackMap";
import WeekendSchedule from "./WeekendSchedule";
import RaceExtras, { RaceDayWeather } from "./RaceExtras";
import SeasonOver from "./SeasonOver";
import Header from "../../layout/Header";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";
import { useLanguage } from "../../../i18n/LanguageContext";

async function loadCalendar() {
  const data = await apiGet("current.json");
  return data.RaceTable?.Races ?? [];
}

// Quando a temporada atual acabou, a Jolpica já devolve a 1ª corrida da próxima (se o calendário saiu)
async function loadNextSeasonRace() {
  const data = await apiGet("current/next.json");
  const race = data.RaceTable?.Races[0];
  return race && !isWeekendOver(race, Date.now()) ? race : null;
}

function CheckeredFlag() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 21V3.5" stroke="#a1a1aa" strokeWidth="1.5" strokeLinecap="round" />
      {[0, 1, 2].map((row) =>
        [0, 1, 2, 3].map((col) => (
          <rect key={`${row}-${col}`} x={5.75 + col * 3.5} y={4 + row * 3} width="3.5" height="3" fill={(row + col) % 2 === 0 ? "#fafafa" : "#27272a"} />
        ))
      )}
    </svg>
  );
}

function SessionStatus({ state, now }: { state: WeekendState; now: number }) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";

  const describe = (session: RaceSession) => {
    const weekday = session.start.toLocaleDateString(locale, { weekday: "long" });
    const time = session.start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${weekday} ${dict.nextRace.at} ${time}`;
  };

  if (state.kind === "upcoming") {
    const label = state.session.key === "race" ? dict.nextRace.lightsOut : `${dict.sessions[state.session.key]} ${dict.nextRace.startsIn}`;
    return (
      <div className="w-full flex flex-col items-center md:items-start gap-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500">{label}</span>
        <CountdownTimer target={state.session.start.getTime()} now={now} />
      </div>
    );
  }

  if (state.kind === "live") {
    return (
      <div className="w-full flex flex-col items-center md:items-start gap-1 py-1" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-red-500 font-black uppercase tracking-[0.3em] text-xs sm:text-sm">{dict.nextRace.liveNow}</span>
        </div>
        <span className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-wider">{dict.sessions[state.session.key]}</span>
        {state.next && (
          <span className="text-xs sm:text-sm text-zinc-500 text-center md:text-left">
            {dict.nextRace.upNext}: <span className="text-zinc-300 font-bold">{dict.sessions[state.next.key]}</span> • {describe(state.next)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center md:justify-start gap-3 py-1">
      <CheckeredFlag />
      <div className="flex flex-col">
        <span className="text-white font-bold uppercase tracking-wider text-lg sm:text-2xl">{dict.nextRace.finishedTitle}</span>
        <span className="text-xs sm:text-sm text-zinc-500">{dict.nextRace.finishedMsg}</span>
      </div>
    </div>
  );
}

export default function NextRace() {
  const { dict } = useLanguage();
  const now = useNow(1000);

  const calendar = useAsyncData("calendar:current", loadCalendar);
  const races = calendar.data;
  const upcoming = races?.find((race) => !isWeekendOver(race, now));
  const nextSeason = useAsyncData(races && !upcoming ? "next-season-race" : null, loadNextSeasonRace);
  const race = upcoming ?? nextSeason.data ?? null;

  const handleScrollDown = () => {
    const sections = document.querySelectorAll("main > section");
    if (sections.length > 1) {
      sections[1].scrollIntoView({ behavior: "smooth" });
    }
  };

  const renderStatus = (content: React.ReactNode) => (
    <div className="w-full h-full flex flex-col relative px-4 py-6 sm:p-8">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-2">
        {content}
      </div>
    </div>
  );

  if (calendar.loading || nextSeason.loading) {
    return renderStatus(<Spinner />);
  }

  if (calendar.error) {
    return renderStatus(
      <>
        <ErrorIcon className="w-12 h-12 mb-2 opacity-50 text-red-500" />
        <span className="font-bold uppercase tracking-wider text-sm text-red-500">{dict.errors.connectionTitle}</span>
        <span className="text-zinc-500 text-xs text-center px-4 mb-2">
          {dict.errors.nextRaceMsg}
        </span>
        <button onClick={calendar.reload} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors">
          {dict.errors.tryAgain}
        </button>
      </>
    );
  }

  if (!race) {
    return renderStatus(<SeasonOver />);
  }

  const sessions = getRaceSessions(race);
  const state = getWeekendState(sessions, now);
  const isNextSeason = Boolean(races?.length) && race.season !== races?.[0]?.season;

  return (
    <div className="w-full h-full flex flex-col relative px-4 py-6 sm:p-8">

      <Header />

      <div className="w-full max-w-4xl mx-auto my-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-h-[85dvh] sm:max-h-none overflow-y-auto sm:overflow-visible relative">

          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full min-w-0">
            <RaceInfo race={race} seasonLabel={isNextSeason ? `${dict.standings.season} ${race.season}` : undefined} />
            <WeekendSchedule sessions={sessions} now={now} />
            <SessionStatus state={state} now={now} />
            <RaceDayWeather race={race} sessions={sessions} now={now} />
          </div>

          <div className="flex flex-col items-center w-full md:w-80 shrink-0 gap-2">
            <TrackMap key={race.Circuit.circuitId} circuitId={race.Circuit.circuitId} country={race.Circuit.Location.country} />
            <RaceExtras race={race} sessions={sessions} now={now} />
          </div>

          <button
            type="button"
            onClick={handleScrollDown}
            aria-label={dict.nextRace.scrollDown}
            className="absolute bottom-4 right-4 flex lg:hidden flex-col items-center text-zinc-500/60 cursor-pointer hover:text-zinc-400 transition-colors z-10"
          >
            <svg className="w-5 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 32" aria-hidden="true">
              <path className="animate-chevron" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4l6 6 6-6" />
              <path className="animate-chevron animation-delay-150" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12l6 6 6-6" />
              <path className="animate-chevron animation-delay-300" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 20l6 6 6-6" />
            </svg>
          </button>

        </div>
      </div>

      <button
        type="button"
        onClick={handleScrollDown}
        aria-label={dict.nextRace.scrollDown}
        className="hidden lg:flex absolute bottom-8 right-8 flex-col items-center gap-2 text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors z-10"
      >
        <div className="flex items-center justify-center w-6 h-10 border-2 border-zinc-500/50 rounded-full relative">
          <div className="w-1.5 bg-[#FB2C36] rounded-full absolute animate-scroll-mouse" />
        </div>
      </button>

    </div>
  );
}
