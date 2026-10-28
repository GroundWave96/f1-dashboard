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
    <div className="flex items-start justify-center landscape:justify-start gap-[clamp(0.5rem,2vw,1.5rem)]" role="timer">
      {units.map((unit, index) => (
        <React.Fragment key={unit.label}>
          {index > 0 && (
            <span className="text-zinc-700 font-light leading-none text-[clamp(1.1rem,min(4vh,5vw),2.5rem)] mt-[0.15em]" aria-hidden="true">:</span>
          )}
          <div className="flex flex-col items-center min-w-[3.2ch]">
            <span
              className={`font-mono font-bold tracking-tighter tabular-nums leading-none text-[clamp(1.6rem,min(6.2vh,9vw),3.75rem)] ${unit.highlight ? "text-red-500" : "text-white"}`}
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] sm:text-[11px] text-muted uppercase tracking-widest mt-1.5">{unit.label}</span>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}
