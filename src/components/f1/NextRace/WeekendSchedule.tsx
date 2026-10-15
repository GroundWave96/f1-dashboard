"use client";

import React from "react";
import { RaceSession } from "../../../lib/sessions";
import { useLanguage } from "../../../i18n/LanguageContext";

interface WeekendScheduleProps {
  sessions: RaceSession[];
  now: number;
}

export default function WeekendSchedule({ sessions, now }: WeekendScheduleProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  const nextSession = sessions.find((s) => s.start.getTime() > now);

  return (
    <div className="hidden [@media(min-height:750px)]:flex sm:flex flex-col w-full border-t border-zinc-800/50 pt-4 mb-4">
      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center md:text-left">
        {dict.nextRace.weekendSchedule}
      </span>
      <ol className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${sessions.length}, minmax(0, 1fr))` }}>
        {sessions.map((session) => {
          const isLive = session.start.getTime() <= now && now < session.end.getTime();
          const isDone = now >= session.end.getTime();
          const isNext = session === nextSession && !isLive;
          const isRace = session.key === "race";

          const weekday = session.start.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
          const time = session.start.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

          const style = isLive
            ? "border-red-500/70 bg-red-500/10 shadow-[0_0_12px_rgba(239,68,68,0.25)]"
            : isNext
              ? "border-red-500/40 bg-zinc-950/50"
              : isDone
                ? "border-zinc-800/30 bg-zinc-950/20 opacity-45"
                : "border-zinc-800/40 bg-zinc-950/30";

          return (
            <li
              key={session.key}
              className={`rounded-md border px-1 py-1.5 sm:py-2 flex flex-col items-center text-center transition-colors ${style}`}
              aria-current={isLive || isNext ? "true" : undefined}
            >
              <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider truncate max-w-full ${isLive || isNext ? "text-red-400" : isRace ? "text-zinc-300" : "text-zinc-500"}`}>
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />}
                {isDone && (
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {dict.sessionsShort[session.key]}
              </span>
              <span className="text-[10px] text-zinc-400 capitalize leading-tight mt-0.5">{weekday}</span>
              <span className={`font-mono text-[11px] sm:text-xs leading-tight ${isRace ? "text-white font-bold" : "text-zinc-200"}`}>{time}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
