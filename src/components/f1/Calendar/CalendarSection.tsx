"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { Race } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";
import { countryToISO } from "../../../lib/f1-utils";
import Spinner from "../../ui/Spinner";

export default function CalendarSection() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const { dict, lang } = useLanguage();
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  const currentYear = new Date().getFullYear();
  const now = new Date();

  useEffect(() => {
    async function fetchCalendar() {
      try {
        const response = await api.get("current.json");
        setRaces(response.data.MRData.RaceTable.Races);
      } catch (err) {
        console.error("Erro ao buscar calendário:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchCalendar();
  }, []);

  const toggleExpand = (roundId: string) => {
    setExpandedId(prev => prev === roundId ? null : roundId);
  };

  const formatDateTime = (dateStr?: string, timeStr?: string) => {
    if (!dateStr || !timeStr) return "--";
    const dateObj = new Date(`${dateStr}T${timeStr}`);
    const day = dateObj.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" }).replace(".", "");
    const time = dateObj.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    const capitalizedDay = day.charAt(0).toUpperCase() + day.slice(1);
    return `${capitalizedDay} ${dict.nextRace.at} ${time}`;
  };

  const getRaceStatus = (raceItem: Race) => {
    const raceDate = new Date(`${raceItem.date}T${raceItem.time || "00:00:00Z"}`);
    if (raceDate < now) return { label: dict.calendar.completed, color: "text-zinc-500", dot: "bg-zinc-600" };
    const nextRace = races.find(r => new Date(`${r.date}T${r.time || "00:00:00Z"}`) >= now);
    const isNext = nextRace?.round === raceItem.round;
    if (isNext) return { label: dict.calendar.next, color: "text-red-500 font-bold", dot: "bg-red-500 animate-pulse" };
    return { label: dict.calendar.upcoming, color: "text-zinc-400", dot: "bg-zinc-400" };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 gap-4 h-full">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-red-500 gap-2 h-full">
        <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 flex flex-col h-full py-4 sm:py-6">
      <div className="flex flex-col mb-4 sm:mb-6 shrink-0 text-center sm:text-left">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.calendar.title}</span>
        <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">{currentYear}</h2>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain rounded-xl custom-scrollbar pr-2 pb-16 lg:pb-0">
        <div className="flex flex-col gap-3">
          {races.map((race) => {
            const isExpanded = expandedId === race.round;
            const status = getRaceStatus(race);

            return (
              <div 
                key={race.round} 
                className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 ease-in-out"
              >
                {/* Cabeçalho do Card (Clicável) */}
                <button 
                  onClick={() => toggleExpand(race.round)}
                  className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`font-mono font-bold text-sm sm:text-base w-6 text-left 
                        ${status.label === dict.calendar.completed ? "text-zinc-600" : 
                        status.label === dict.calendar.next ? "text-red-500" : "text-zinc-400"}`}>
                        {race.round.padStart(2, '0')}
                    </span>
                    <img
                        src={`https://flagcdn.com/w40/${countryToISO(race.Circuit.Location.country)}.png`}
                        alt={race.Circuit.Location.country}
                        className="w-6 h-auto rounded-sm shadow-sm"
                        loading="lazy"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-white font-bold uppercase tracking-wide text-sm sm:text-base line-clamp-1">
                        {race.raceName}
                      </span>
                      <span className="text-zinc-500 text-[10px] sm:text-xs uppercase tracking-wider line-clamp-1">
                        {race.Circuit.circuitName}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      <span className={`text-[10px] uppercase tracking-widest ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <svg className={`w-5 h-5 text-zinc-500 transform transition-transform duration-300 ${isExpanded ? "rotate-180 text-white" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Conteúdo Expandido (Cronograma) */}
                <div className={`transition-all duration-300 ease-in-out bg-zinc-950/50 ${isExpanded ? "max-h-96 opacity-100 border-t border-zinc-800" : "max-h-0 opacity-0"}`}>
                  <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    
                    {/* Linhas de Treino / Sprint */}
                    {race.FirstPractice && (
                      <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{dict.calendar.fp1}</span>
                        <span className="text-xs text-zinc-200 font-mono">{formatDateTime(race.FirstPractice.date, race.FirstPractice.time)}</span>
                      </div>
                    )}
                    
                    {(race.SprintShootout || race.SecondPractice) && (
                      <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          {race.SprintShootout ? dict.calendar.sprintShootout : dict.calendar.fp2}
                        </span>
                        <span className="text-xs text-zinc-200 font-mono">
                          {formatDateTime(race.SprintShootout?.date || race.SecondPractice?.date, race.SprintShootout?.time || race.SecondPractice?.time)}
                        </span>
                      </div>
                    )}

                    {(race.Sprint || race.ThirdPractice) && (
                      <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">
                          {race.Sprint ? dict.calendar.sprint : dict.calendar.fp3}
                        </span>
                        <span className="text-xs text-zinc-200 font-mono">
                          {formatDateTime(race.Sprint?.date || race.ThirdPractice?.date, race.Sprint?.time || race.ThirdPractice?.time)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-b border-zinc-800/50 pb-2">
                      <span className="text-xs text-red-400 font-bold uppercase tracking-wider">{dict.calendar.qualifying}</span>
                      <span className="text-xs text-zinc-200 font-mono">{formatDateTime(race.Qualifying?.date, race.Qualifying?.time)}</span>
                    </div>

                    <div className="flex justify-between sm:col-span-2 bg-red-950/20 border border-red-900/30 rounded p-3 mt-1">
                      <span className="text-sm text-red-500 font-black uppercase tracking-widest">{dict.calendar.race}</span>
                      <span className="text-sm text-white font-mono font-bold">{formatDateTime(race.date, race.time)}</span>
                    </div>

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