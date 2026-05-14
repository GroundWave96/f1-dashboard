"use client";

import React, { useEffect, useState } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string;
  targetTime: string;
}

export default function CountdownTimer({ targetDate, targetTime }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const raceDateStr = `${targetDate}T${targetTime || "00:00:00Z"}`;
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
  }, [targetDate, targetTime]);

  if (!timeLeft) return null;

  return (
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
  );
}