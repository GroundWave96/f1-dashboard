"use client";

import React from "react";
import { createPortal } from "react-dom";
import { Driver, Race } from "../../../types/f1";
import { getRaceSessions } from "../../../lib/sessions";
import { countryToISO } from "../../../lib/f1-utils";
import { useDialog } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";
import { TrophyIcon } from "../../ui/icons";

interface RaceDetailsModalProps {
  race: Race;
  winner?: Driver;
  onClose: () => void;
}

/** Janela com a programação completa de uma etapa (horários no fuso de quem está vendo). */
export default function RaceDetailsModal({ race, winner, onClose }: RaceDetailsModalProps) {
  const { dict, lang } = useLanguage();
  const locale = lang === "pt" ? "pt-BR" : "en-US";
  useDialog(onClose);

  const formatDateTime = (date: Date) => {
    const day = date.toLocaleDateString(locale, { weekday: "short", day: "2-digit", month: "short" }).replace(".", "");
    const time = date.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${dict.nextRace.at} ${time}`;
  };

  // Renderizado direto no <body>: nenhum container da página interfere na posição do modal
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-white" role="dialog" aria-modal="true" aria-label={race.raceName}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

      <div className="relative w-full max-w-md max-h-[92dvh] overflow-y-auto custom-scrollbar bg-zinc-900/90 backdrop-blur-xl border border-zinc-700/50 rounded-3xl shadow-2xl p-6 animate-in fade-in motion-safe:zoom-in-95 duration-200">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label={dict.driverModal.close}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-red-500 rounded-full p-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="flex items-center gap-3 pr-10 mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://flagcdn.com/w80/${countryToISO(race.Circuit.Location.country)}.png`} alt={race.Circuit.Location.country} className="w-8 h-auto rounded shadow" />
          <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">
            {dict.nextRace.round} {race.round}
          </span>
          {race.Sprint && (
            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 bg-amber-400/10 rounded px-1.5 py-0.5">
              {dict.nextRace.sprint}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-white uppercase tracking-wider leading-tight">{race.raceName}</h3>
        <p className="text-xs text-muted mb-5">
          {race.Circuit.circuitName} • {race.Circuit.Location.locality}, {race.Circuit.Location.country}
        </p>

        {winner && (
          <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/25 rounded-lg px-3 py-2 mb-4">
            <TrophyIcon className="w-5 h-5 text-yellow-400 shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">{dict.calendar.winner}</span>
            <span className="ml-auto text-sm font-bold text-white uppercase">{winner.givenName} {winner.familyName}</span>
          </div>
        )}

        <ul className="flex flex-col gap-2">
          {getRaceSessions(race).map((session) =>
            session.key === "race" ? (
              <li key={session.key} className="flex justify-between bg-red-950/20 border border-red-900/30 rounded-lg px-3 py-2.5 mt-1">
                <span className="text-sm text-red-500 font-black uppercase tracking-widest">{dict.sessions.race}</span>
                <span className="text-sm text-white font-mono font-bold">{formatDateTime(session.start)}</span>
              </li>
            ) : (
              <li key={session.key} className="flex justify-between gap-3 border-b border-zinc-800/60 px-1 pb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${session.key === "qualifying" ? "text-red-400" : "text-zinc-400"}`}>
                  {dict.sessions[session.key]}
                </span>
                <span className="text-xs text-zinc-200 font-mono">{formatDateTime(session.start)}</span>
              </li>
            )
          )}
        </ul>
      </div>
    </div>,
    document.body
  );
}
