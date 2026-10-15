"use client";

import React from "react";
import { useLanguage } from "../../../i18n/LanguageContext";

interface CountdownTimerProps {
  target: number;
  now: number;
}

const getTimeLeft = (distanceMs: number) => {
  const distance = Math.max(distanceMs, 0);
  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((distance % (1000 * 60)) / 1000),
  };
};

export default function CountdownTimer({ target, now }: CountdownTimerProps) {
  const { dict } = useLanguage();
  const timeLeft = getTimeLeft(target - now);

  const units = [
    { value: timeLeft.days, label: dict.nextRace.days },
    { value: timeLeft.hours, label: dict.nextRace.hours },
    { value: timeLeft.minutes, label: dict.nextRace.minutes },
    { value: timeLeft.seconds, label: dict.nextRace.seconds, highlight: true },
  ];

  return (
    <div className="flex justify-between sm:justify-start items-start w-full sm:gap-6 max-w-full overflow-hidden px-1 sm:px-0" role="timer">
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          {index > 0 && <span className="text-xl sm:text-4xl text-zinc-700 font-light mt-0.5 sm:mt-1 shrink-0">:</span>}
          <div className="flex flex-col items-center flex-1 sm:flex-none">
            <span className={`text-2xl sm:text-5xl font-mono font-bold tracking-tighter tabular-nums ${unit.highlight ? "text-red-500" : "text-white"}`}>
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-xs text-gray-500 uppercase tracking-widest mt-1 truncate w-full text-center">{unit.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
