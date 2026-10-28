"use client";

import React from "react";
import Image from "next/image";
import { Race } from "../../../types/f1";
import { loadCircuitHistory } from "../../../lib/circuit";
import { useAsyncData } from "../../../lib/hooks";
import { RaceSession } from "../../../lib/sessions";
import { fetchWeekendForecast, FORECAST_RANGE_MS, weatherIcon, WeatherIcon } from "../../../lib/weather";
import { getConstructorLogo, nationalityToISO } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface RaceExtrasProps {
  race: Race;
  sessions: RaceSession[];
  now: number;
}

const CLOUD = "M7.5 18.5h9.25a3.75 3.75 0 0 0 .5-7.47 5.25 5.25 0 0 0-10.1-1.03A4.25 4.25 0 0 0 7.5 18.5z";
const SUN_RAYS = "M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4";

function WeatherGlyph({ icon, className = "w-7 h-7" }: { icon: WeatherIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {icon === "sun" && (
        <g className="stroke-amber-400">
          <circle cx="12" cy="12" r="4" />
          <path d={SUN_RAYS} />
        </g>
      )}
      {icon === "partly" && (
        <>
          <g className="stroke-amber-400" transform="translate(-3 -3) scale(0.75)">
            <circle cx="12" cy="12" r="4" />
            <path d={SUN_RAYS} />
          </g>
          <path d={CLOUD} transform="translate(1.5 1)" className="stroke-zinc-300 fill-zinc-900" />
        </>
      )}
      {icon === "cloud" && <path d={CLOUD} className="stroke-zinc-300" />}
      {(icon === "rain" || icon === "storm") && (
        <>
          <path d={CLOUD} transform="translate(0 -3.5)" className="stroke-zinc-300" />
          {icon === "rain" ? (
            <path d="M9 18l-1 2.5M12.5 18l-1 2.5M16 18l-1 2.5" className="stroke-sky-400" />
          ) : (
            <path d="M12.5 16.5l-2 3h3l-2 3" className="stroke-amber-400" />
          )}
        </>
      )}
    </svg>
  );
}

function useWeekendForecast(race: Race, sessions: RaceSession[], now: number) {
  const { lat, long } = race.Circuit.Location;
  const raceSession = sessions[sessions.length - 1];
  const withinForecast = Boolean(lat && long && raceSession) && raceSession.start.getTime() - now <= FORECAST_RANGE_MS;
  return useAsyncData(
    withinForecast ? `weather:${race.season}-${race.round}` : null,
    () => fetchWeekendForecast(lat!, long!, sessions.map((s) => s.start))
  ).data;
}

const weekdayOf = (date: string, locale: string) =>
  new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" }).replace(".", "");

/**
 * Previsão do tempo do fim de semana + últimos vencedores no circuito.
 * Os dois blocos ficam lado a lado quando há largura (container query) e empilhados no celular.
 */
export default function RaceExtras({ race, sessions, now }: RaceExtrasProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const forecast = useWeekendForecast(race, sessions, now);

  const circuitId = race.Circuit.circuitId;
  const { data: history } = useAsyncData(`circuit:${circuitId}`, () => loadCircuitHistory(circuitId));
  const winners = history?.winners;

  const hasForecast = Boolean(forecast?.length);
  const hasWinners = Boolean(winners?.length);
  if (!hasForecast && !hasWinners) return null;

  const label = "block text-[10px] font-bold text-muted uppercase tracking-widest mb-2";
  const chip = "bg-zinc-950/40 border border-zinc-800/50 rounded-lg desk-tall:min-h-[4.25rem]";

  return (
    <div className="@container w-full shrink-0">
      <div className={`grid gap-[clamp(0.6rem,2vh,1.6rem)] ${hasForecast && hasWinners ? "@3xl:grid-cols-2" : ""}`}>
        {hasForecast && (
          <div className="min-w-0">
            <span className={label}>{dict.nextRace.weather}</span>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${forecast!.length}, minmax(0, 1fr))` }}>
              {forecast!.map((day) => (
                <div key={day.date} className={`${chip} flex items-center gap-1 @sm:gap-1.5 px-1.5 @sm:px-2 py-1.5 min-w-0`}>
                  <WeatherGlyph icon={weatherIcon(day.code)} className="w-5 h-5 @sm:w-6 @sm:h-6 shrink-0" />
                  <div className="flex flex-col leading-tight min-w-0">
                    <span className="text-[9px] sm:text-[10px] text-zinc-400 uppercase font-bold tracking-wide whitespace-nowrap">
                      {weekdayOf(day.date, locale)}
                      {day.rain !== null && (
                        <span className={`ml-1 font-mono normal-case ${day.rain >= 50 ? "text-sky-400" : "text-muted"}`}>{day.rain}%</span>
                      )}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono text-white whitespace-nowrap">
                      {day.max}° <span className="text-muted">{day.min}°</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasWinners && (
          <div className="@container min-w-0 hide-short-portrait">
            <span className={label}>{dict.nextRace.pastWinners}</span>
            <ul className="grid grid-cols-3 gap-1.5">
              {winners!.map((winnerRace) => {
                const winner = winnerRace.Results?.[0];
                if (!winner) return null;
                return (
                  <li key={winnerRace.season} className={`${chip} flex items-center gap-1.5 px-2 py-1.5 min-w-0`} title={`${winner.Driver.givenName} ${winner.Driver.familyName} • ${winner.Constructor.name}`}>
                    <Image
                      src={getConstructorLogo(winner.Constructor.constructorId)}
                      alt={winner.Constructor.name}
                      width={20}
                      height={20}
                      className="w-5 h-5 object-contain brightness-110 shrink-0"
                    />
                    <div className="flex flex-col leading-tight min-w-0">
                      <span className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-muted">
                        {winnerRace.season}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://flagcdn.com/w40/${nationalityToISO(winner.Driver.nationality)}.png`}
                          alt=""
                          className="w-3 h-auto rounded-[2px]"
                          loading="lazy"
                        />
                      </span>
                      {/* Bloco estreito: sigla do piloto (VER, HAM...), que sempre cabe; com espaço, o sobrenome */}
                      <span className="text-[11px] sm:text-xs font-bold text-white uppercase @md:hidden" aria-hidden="true">
                        {winner.Driver.code ?? winner.Driver.familyName}
                      </span>
                      <span className="sr-only @md:not-sr-only @md:truncate text-[11px] sm:text-xs font-bold text-white uppercase">{winner.Driver.familyName}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
