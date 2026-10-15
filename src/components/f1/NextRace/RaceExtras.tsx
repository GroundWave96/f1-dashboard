"use client";

import React from "react";
import Image from "next/image";
import { Race } from "../../../types/f1";
import { apiGet } from "../../../lib/api";
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

function WeatherGlyph({ icon }: { icon: WeatherIcon }) {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
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

/** Versão compacta para o celular: só a previsão do dia da corrida. */
export function RaceDayWeather({ race, sessions, now }: RaceExtrasProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const forecast = useWeekendForecast(race, sessions, now);
  const raceDay = forecast?.[forecast.length - 1];
  if (!raceDay) return null;

  return (
    <div className="sm:hidden flex items-center justify-center gap-2 mt-4 bg-zinc-950/40 border border-zinc-800/50 rounded-full px-3 py-1 text-xs">
      <WeatherGlyph icon={weatherIcon(raceDay.code)} />
      <span className="text-zinc-400 capitalize">{weekdayOf(raceDay.date, locale)}</span>
      <span className="font-mono text-white">
        {raceDay.max}° <span className="text-zinc-500">/ {raceDay.min}°</span>
      </span>
      {raceDay.rain !== null && (
        <span className={`font-mono ${raceDay.rain >= 50 ? "text-sky-400" : "text-zinc-500"}`}>
          • {raceDay.rain}% {dict.nextRace.rain}
        </span>
      )}
    </div>
  );
}

export default function RaceExtras({ race, sessions, now }: RaceExtrasProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const forecast = useWeekendForecast(race, sessions, now);

  const circuitId = race.Circuit.circuitId;
  const { data: winners } = useAsyncData(`winners:${circuitId}`, async () => {
    const data = await apiGet(`circuits/${circuitId}/results/1.json?limit=100`);
    return (data.RaceTable?.Races ?? []).slice(-3).reverse();
  });

  if (!forecast?.length && !winners?.length) return null;

  return (
    <div className="hidden sm:flex flex-col gap-4 w-full px-2 pb-2">
      {forecast && forecast.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center md:text-left">
            {dict.nextRace.weather}
          </span>
          <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${forecast.length}, minmax(0, 1fr))` }}>
            {forecast.map((day) => (
              <div key={day.date} className="bg-zinc-950/40 border border-zinc-800/40 rounded-lg px-2 py-2 flex flex-col items-center gap-0.5">
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
                  {weekdayOf(day.date, locale)}
                </span>
                <WeatherGlyph icon={weatherIcon(day.code)} />
                <span className="text-xs font-mono text-white">
                  {day.max}° <span className="text-zinc-500">/ {day.min}°</span>
                </span>
                {day.rain !== null && (
                  <span className={`text-[10px] font-mono ${day.rain >= 50 ? "text-sky-400" : "text-zinc-500"}`}>
                    {day.rain}% {dict.nextRace.rain}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {winners && winners.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center md:text-left">
            {dict.nextRace.pastWinners}
          </span>
          <ul className="flex flex-col gap-1">
            {winners.map((winnerRace) => {
              const winner = winnerRace.Results?.[0];
              if (!winner) return null;
              return (
                <li key={winnerRace.season} className="flex items-center gap-3 bg-zinc-950/30 border border-zinc-800/30 rounded-md px-3 py-1.5">
                  <span className="font-mono text-xs text-zinc-500 w-9">{winnerRace.season}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`https://flagcdn.com/w40/${nationalityToISO(winner.Driver.nationality)}.png`}
                    alt={winner.Driver.nationality}
                    className="w-4 h-auto rounded-sm"
                    loading="lazy"
                  />
                  <span className="text-xs text-zinc-300 flex-1 truncate">
                    {winner.Driver.givenName.charAt(0)}. <span className="font-bold text-white uppercase">{winner.Driver.familyName}</span>
                  </span>
                  <Image
                    src={getConstructorLogo(winner.Constructor.constructorId)}
                    alt={winner.Constructor.name}
                    width={20}
                    height={20}
                    className="w-5 h-5 object-contain brightness-110"
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
