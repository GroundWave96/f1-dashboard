"use client";

import React from "react";
import { apiGet } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { getRaceSessions, getWeekendState, isWeekendOver, RaceSession, WeekendState } from "../../../lib/sessions";
import RaceInfo from "./RaceInfo";
import CountdownTimer from "./CountdownTimer";
import TrackMap from "./TrackMap";
import WeekendSchedule from "./WeekendSchedule";
import RaceExtras from "./RaceExtras";
import CircuitFacts from "./CircuitFacts";
import SeasonOver from "./SeasonOver";
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
      <div className="w-full flex flex-col items-center landscape:items-start gap-2">
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted">{label}</span>
        <CountdownTimer target={state.session.start.getTime()} now={now} />
      </div>
    );
  }

  if (state.kind === "live") {
    return (
      <div className="w-full flex flex-col items-center landscape:items-start gap-1" aria-live="polite">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-3 w-3">
            <span className="motion-safe:animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
          </span>
          <span className="text-red-500 font-black uppercase tracking-[0.3em] text-xs sm:text-sm">{dict.nextRace.liveNow}</span>
        </div>
        <span className="font-bold text-white uppercase tracking-wider text-[clamp(1.5rem,min(5vh,7vw),2.75rem)] leading-tight">{dict.sessions[state.session.key]}</span>
        {state.next && (
          <span className="text-xs sm:text-sm text-muted text-center landscape:text-left">
            {dict.nextRace.upNext}: <span className="text-zinc-300 font-bold">{dict.sessions[state.next.key]}</span> • {describe(state.next)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex items-center justify-center landscape:justify-start gap-3">
      <CheckeredFlag />
      <div className="flex flex-col">
        <span className="text-white font-bold uppercase tracking-wider text-lg sm:text-2xl">{dict.nextRace.finishedTitle}</span>
        <span className="text-xs sm:text-sm text-muted">{dict.nextRace.finishedMsg}</span>
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

  const renderStatus = (content: React.ReactNode) => (
    <div className="shell h-full min-h-[60svh] flex flex-col py-4 sm:py-6">
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2">
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
        <span className="text-muted text-xs text-center px-4 mb-2">
          {dict.errors.nextRaceMsg}
        </span>
        <button onClick={calendar.reload} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-[background-color,scale] duration-150 motion-safe:active:scale-[0.96]">
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

  // O card ocupa exatamente a altura disponível; o mapa é a parte "elástica" que cresce ou encolhe,
  // então nada precisa de rolagem. Retrato (celular/tablet/monitor vertical): uma coluna.
  // Paisagem (computador/celular deitado): duas colunas alinhadas em cima e embaixo — à esquerda,
  // nome do GP no topo, contagem no meio e programação + circuito na base, na mesma linha da
  // previsão do tempo e dos vencedores da coluna da direita.
  return (
    <div className="shell h-full flex flex-col py-3 sm:py-5">
      <article
        className="reveal relative flex-1 min-h-0 flex flex-col landscape:flex-row gap-[clamp(0.75rem,2.2vh,2rem)] landscape:gap-[clamp(1rem,3vw,3.5rem)] glass rounded-[1.75rem] p-4 sm:p-6 lg:p-8 [@media(max-height:500px)]:p-3"
        style={{ "--i": 1 } as React.CSSProperties}
      >
        <div className="shrink-0 landscape:shrink landscape:flex-1 landscape:basis-0 min-w-0 flex flex-col items-center landscape:items-start landscape:justify-between gap-[clamp(0.6rem,2vh,1.6rem)]">
          <RaceInfo race={race} seasonLabel={isNextSeason ? `${dict.standings.season} ${race.season}` : undefined} />
          <SessionStatus state={state} now={now} />
          <div className="w-full flex flex-col items-center landscape:items-start gap-[clamp(0.6rem,2vh,1.6rem)]">
            <WeekendSchedule sessions={sessions} now={now} />
            <CircuitFacts
              circuitId={race.Circuit.circuitId}
              className="hidden [@media(orientation:landscape)_and_(min-height:760px)]:flex [@media(orientation:portrait)_and_(min-height:1200px)]:flex"
            />
          </div>
        </div>

        {/* Coluna do mapa: elástica quando a tela tem altura fixa; no celular em pé, altura do conteúdo */}
        <div className="landscape:flex-1 landscape:basis-0 fill:flex-1 fill:basis-0 fill:min-h-0 min-w-0 flex flex-col gap-[clamp(0.6rem,2vh,1.6rem)]">
          {/* No celular a altura vem do conteúdo, então o mapa tem um tamanho mínimo; no computador ele é "elástico" */}
          <div className="relative flex-1 min-h-64 fill:min-h-16">
            <TrackMap key={race.Circuit.circuitId} circuitId={race.Circuit.circuitId} country={race.Circuit.Location.country} />
          </div>
          <RaceExtras race={race} sessions={sessions} now={now} />
        </div>
      </article>

    </div>
  );
}
