import React from "react";
import { PastRace } from "../../../types/f1";

interface RaceInfoProps {
  race: PastRace;
}

export default function RaceInfo({ race }: RaceInfoProps) {
  const raceDateObj = new Date(`${race.date}T${race.time}`);
  const formattedDate = raceDateObj.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const formattedTime = raceDateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <span className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">
        Próxima Corrida • Rodada {race.round}
      </span>
      <h2 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-1">
        {race.raceName}
      </h2>
      <p className="text-gray-400 text-sm sm:text-base mb-6">
        {race.Circuit.circuitName} • {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>

      <div className="flex items-center gap-3 text-zinc-300 font-medium mb-8 bg-zinc-950/50 py-2 px-4 rounded-lg border border-zinc-800/50">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="capitalize">{formattedDate} às {formattedTime}</span>
      </div>
    </>
  );
}