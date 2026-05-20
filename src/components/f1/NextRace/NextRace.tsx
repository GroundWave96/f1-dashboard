"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PastRace } from "../../../types/f1";
import RaceInfo from "./RaceInfo";
import CountdownTimer from "./CountdownTimer";
import TrackMap from "./TrackMap";
import Header from "../../layout/Header";
import Spinner from "../../ui/Spinner";
import { useLanguage } from "../../../i18n/LanguageContext";

export default function NextRace() {
  const { dict } = useLanguage();
  const [nextRace, setNextRace] = useState<PastRace | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    async function fetchNextRace() {
      try {
        const response = await api.get("current/next.json");
        const race = response.data.MRData.RaceTable.Races[0];
        setNextRace(race);
      } catch (error) {
        console.error("Erro ao buscar próxima corrida:", error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchNextRace();
  }, []);

  const handleScrollDown = () => {
    const sections = document.querySelectorAll("main > section");
    if (sections.length > 1) {
      sections[1].scrollIntoView({ behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 py-10 h-full w-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-red-500 gap-2 h-full w-full">
        <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
        <span className="text-zinc-500 text-xs text-center px-4">
          {dict.errors.nextRaceMsg}
        </span>
      </div>
    );
  }

  if (!nextRace) return null;

  return (
    <div className="w-full h-full flex flex-col relative px-4 py-6 sm:p-8">

      <Header />

      <div className="w-full max-w-4xl mx-auto my-auto">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8 max-h-[85dvh] sm:max-h-none overflow-y-auto sm:overflow-visible relative">

          <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full">
            <RaceInfo race={nextRace} />
            <CountdownTimer targetDate={nextRace.date} targetTime={nextRace.time} />
          </div>

          <TrackMap circuitId={nextRace.Circuit.circuitId} />

          <div onClick={handleScrollDown} className="absolute bottom-4 right-4 flex lg:hidden flex-col items-center text-zinc-500/60 cursor-pointer hover:text-zinc-400 transition-colors z-10">
            <svg className="w-5 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 32">
              <path className="animate-chevron" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 4l6 6 6-6" />
              <path className="animate-chevron animation-delay-150" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 12l6 6 6-6" />
              <path className="animate-chevron animation-delay-300" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 20l6 6 6-6" />
            </svg>
          </div>

        </div>
      </div>

      <div onClick={handleScrollDown} className="hidden lg:flex absolute bottom-8 right-8 flex-col items-center gap-2 text-zinc-500 cursor-pointer hover:text-zinc-400 transition-colors z-10">
        <div className="flex items-center justify-center w-6 h-10 border-2 border-zinc-500/50 rounded-full relative">
          <div className="w-1.5 bg-[#FB2C36] rounded-full absolute animate-scroll-mouse" />
        </div>
      </div>

    </div>
  );
}