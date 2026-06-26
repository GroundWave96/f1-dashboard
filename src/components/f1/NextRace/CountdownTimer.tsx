"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";

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
  
  const { dict } = useLanguage();

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
    <div className="flex justify-between sm:justify-start items-start w-full sm:gap-6 max-w-full overflow-hidden px-1 sm:px-0">
      
      <div className="flex flex-col items-center flex-1 sm:flex-none">
        <span className="text-2xl sm:text-5xl font-mono font-bold text-white tracking-tighter">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center">{dict.nextRace.days}</span>
      </div>
      
      <span className="text-xl sm:text-4xl text-zinc-700 font-light mt-0.5 sm:mt-1 shrink-0">:</span>
      
      <div className="flex flex-col items-center flex-1 sm:flex-none">
        <span className="text-2xl sm:text-5xl font-mono font-bold text-white tracking-tighter">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center">{dict.nextRace.hours}</span>
      </div>
      
      <span className="text-xl sm:text-4xl text-zinc-700 font-light mt-0.5 sm:mt-1 shrink-0">:</span>
      
      <div className="flex flex-col items-center flex-1 sm:flex-none">
        <span className="text-2xl sm:text-5xl font-mono font-bold text-white tracking-tighter">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center">{dict.nextRace.minutes}</span>
      </div>
      
      <span className="text-xl sm:text-4xl text-zinc-700 font-light mt-0.5 sm:mt-1 shrink-0">:</span>
      
      <div className="flex flex-col items-center flex-1 sm:flex-none">
        <span className="text-2xl sm:text-5xl font-mono font-bold text-red-500 tracking-tighter">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center">{dict.nextRace.seconds}</span>
      </div>
    </div>
  );
}