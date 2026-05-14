"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PastRace } from "../../types/f1"; 

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function NextRace() {
  const [nextRace, setNextRace] = useState<PastRace | null>(null);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Busca os dados da próxima corrida
  useEffect(() => {
    async function fetchNextRace() {
      try {
        const response = await api.get("current/next.json");
        const race = response.data.MRData.RaceTable.Races[0];
        setNextRace(race);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar próxima corrida:", error);
        setLoading(false);
      }
    }
    fetchNextRace();
  }, []);

  // Lógica do Cronômetro
  useEffect(() => {
    if (!nextRace) return;

    // Concatena a data e hora para criar o objeto Date do momento da largada
    const raceDateStr = `${nextRace.date}T${nextRace.time || "00:00:00Z"}`;
    const raceDate = new Date(raceDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = raceDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [nextRace]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 py-10">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!nextRace) return null;

  // Formatação para horário de Brasília
  const raceDateObj = new Date(`${nextRace.date}T${nextRace.time}`);
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
    <div className="w-full max-w-4xl mx-auto px-2 mb-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* LADO ESQUERDO: Informações e Cronômetro */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left flex-1 w-full">
          <span className="text-red-500 font-bold uppercase tracking-widest text-xs mb-2">
            Próxima Corrida • Rodada {nextRace.round}
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-1">
            {nextRace.raceName}
          </h2>
          <p className="text-gray-400 text-sm sm:text-base mb-6">
            {nextRace.Circuit.circuitName} • {nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}
          </p>

          <div className="flex items-center gap-3 text-zinc-300 font-medium mb-8 bg-zinc-950/50 py-2 px-4 rounded-lg border border-zinc-800/50">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate} às {formattedTime}</span>
          </div>

          {/* CRONÔMETRO MINIMALISTA */}
          {timeLeft && (
            <div className="flex gap-4 sm:gap-6 justify-center md:justify-start w-full">
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Dias</span>
              </div>
              <span className="text-2xl sm:text-4xl text-zinc-700 font-light mt-1">:</span>
              
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Horas</span>
              </div>
              <span className="text-2xl sm:text-4xl text-zinc-700 font-light mt-1">:</span>
              
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Minutos</span>
              </div>
              <span className="text-2xl sm:text-4xl text-zinc-700 font-light mt-1">:</span>
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-5xl font-mono font-bold text-red-500">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1">Segundos</span>
              </div>
            </div>
          )}
        </div>

        {/* LADO DIREITO: Mapa do Circuito */}
        <div className="w-full md:w-1/2 flex justify-center md:justify-end opacity-80 hover:opacity-100 transition-opacity mt-6 md:mt-0">
          <img 
            src={`/circuits/${nextRace.Circuit.circuitId}.svg`} 
            alt={`Traçado do circuito ${nextRace.Circuit.circuitName}`}
            className="w-full max-w-[280px] sm:max-w-[350px] drop-shadow-2xl brightness-200"
            onError={(e) => (e.currentTarget.style.display = 'none')} 
          />
        </div>

      </div>
    </div>
  );
}