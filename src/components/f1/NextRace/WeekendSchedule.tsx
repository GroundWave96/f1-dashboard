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
  // Largura de cada coluna proporcional ao rótulo ("Corrida", "Q. Sprint" ficam mais largas), para todos caberem inteiros
  const columns = sessions.map((s) => `minmax(0, ${Math.min(Math.max(dict.sessionsShort[s.key].length / 5, 1), 1.6)}fr)`).join(" ");

  return (
    <div className="flex flex-col w-full max-w-xl gap-2">
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">
        {dict.nextRace.weekendSchedule}
      </span>
      <ol className="grid gap-1 sm:gap-1.5" style={{ gridTemplateColumns: columns }}>
        {sessions.map((session) => {
          const isLive = session.start.getTime() <= now && now < session.end.getTime();
          const isDone = now >= session.end.getTime();
          const isNext = session === nextSession && !isLive;
          const isRace = session.key === "race";

          const weekday = session.start.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
          // Formato compacto (sem zero à esquerda) para caber também com AM/PM em inglês
          const time = session.start.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }).replace(/\s?([AP])M$/i, (_, p) => p.toLowerCase());

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
              className={`rounded-md border px-0.5 sm:px-1 py-[clamp(0.3rem,0.9vh,0.6rem)] flex flex-col items-center text-center transition-colors ${style}`}
              aria-current={isLive || isNext ? "true" : undefined}
            >
              <span className={`flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-normal sm:tracking-wide truncate max-w-full ${isLive || isNext ? "text-red-400" : isRace ? "text-zinc-300" : "text-muted"}`}>
                {isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 motion-safe:animate-pulse shrink-0" />}
                {isDone && (
                  <svg className="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {dict.sessionsShort[session.key]}
              </span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 capitalize leading-tight mt-0.5">{weekday}</span>
              <span className={`font-mono text-[11px] sm:text-xs leading-tight whitespace-nowrap ${isRace ? "text-white font-bold" : "text-zinc-200"}`}>{time}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
