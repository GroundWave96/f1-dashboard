"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PastRace } from "../../../types/f1"; 
import RaceInfo from "./RaceInfo";
import CountdownTimer from "./CountdownTimer";
import TrackMap from "./TrackMap";

export default function NextRace() {
  const [nextRace, setNextRace] = useState<PastRace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchNextRace() {
      try {
        const response = await api.get("current/next.json");
        const race = response.data.MRData.RaceTable.Races[0];
        setNextRace(race);
      } catch (error) {
        console.error("Erro ao buscar próxima corrida:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchNextRace();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 py-10 h-full w-full">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!nextRace) return null;

  return (
    <div className="w-full h-full flex flex-col relative px-4 py-6 sm:p-8">
      
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0">
        <img src="/teams/f1.svg" alt="F1 Logo" className="h-5 sm:h-6 w-auto opacity-90 shrink-0 max-w-none" />
        <span className="text-zinc-500 font-bold text-[10px] sm:text-xs uppercase tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800">
          Dashboard
        </span>
      </header>

      <div className="w-full max-w-4xl mx-auto my-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-h-[85dvh] sm:max-h-none overflow-y-auto sm:overflow-visible">
          
          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full">
            <RaceInfo race={nextRace} />
            <CountdownTimer targetDate={nextRace.date} targetTime={nextRace.time} />
          </div>

          <TrackMap circuitId={nextRace.Circuit.circuitId} circuitName={nextRace.Circuit.circuitName} />

        </div>
      </div>
      
    </div>
  );
}