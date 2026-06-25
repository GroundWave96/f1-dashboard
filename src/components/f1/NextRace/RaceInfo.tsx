import React from "react";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";

interface RaceInfoProps {
  race: PastRace;
}

export default function RaceInfo({ race }: RaceInfoProps) {
  const { dict, lang } = useLanguage();
  const raceDateObj = new Date(`${race.date}T${race.time}`);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';

  const formattedDate = raceDateObj.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const formattedTime = raceDateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatSession = (session?: { date: string; time: string }) => {
    if (!session || !session.time) return "--";
    const sessionDate = new Date(`${session.date}T${session.time}`);
    const day = sessionDate.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
    const time = sessionDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${dict.nextRace.at} ${time}`;
  };

  return (
    <div className="w-full flex flex-col items-center md:items-start">
      <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 sm:mb-2">
        {dict.nextRace.title} • {dict.nextRace.round} {race.round}
      </span>
      <h2 className="text-xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-1">
        {race.raceName}
      </h2>
      <p className="text-gray-400 text-xs sm:text-base mb-3 sm:mb-6">
        {race.Circuit.circuitName} • {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>

      <div className="flex items-center gap-2 sm:gap-3 text-zinc-300 font-medium mb-4 sm:mb-6 bg-zinc-950/50 py-1.5 sm:py-2 px-3 sm:px-4 rounded-lg border border-zinc-800/50 text-xs sm:text-base">
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span >{capitalizedDate} {dict.nextRace.at} {formattedTime}</span>
      </div>

      <div className="hidden [@media(min-height:750px)]:flex sm:flex flex-col w-full md:max-w-[80%] border-t border-zinc-800/50 pt-4 mb-4">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center md:text-left">
          {dict.nextRace.weekendHighlights}
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950/30 rounded p-2 border border-zinc-800/30 flex flex-col justify-center items-center">
                <span className="text-zinc-500 font-bold uppercase text-[9px] mb-0.5">
                    {race.Sprint ? dict.nextRace.sprint : dict.nextRace.fp1}
                </span>
                <span className="text-white font-mono text-center">
                    {formatSession(race.Sprint || race.FirstPractice)}
                </span>
            </div>
            <div className="bg-zinc-950/30 rounded p-2 border border-zinc-800/30 flex flex-col justify-center items-center">
                <span className="text-zinc-500 font-bold uppercase text-[9px] mb-0.5">
                    {dict.nextRace.qualifying}
                </span>
                <span className="text-white font-mono text-center">
                    {formatSession(race.Qualifying)}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}