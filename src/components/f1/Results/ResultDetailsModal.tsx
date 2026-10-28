"use client";

import React from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { RaceResult } from "../../../types/f1";
import { getConstructorLogo, getResultOutcome, nationalityToISO, OUTCOME_LABEL, translateStatus } from "../../../lib/f1-utils";
import { useDialog } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";

interface ResultDetailsModalProps {
  result: RaceResult;
  leaderLaps: number;
  raceName: string;
  onClose: () => void;
}

/** Detalhes de um resultado: largada, posições ganhas, tempo, pontos e melhor volta. */
export default function ResultDetailsModal({ result, leaderLaps, raceName, onClose }: ResultDetailsModalProps) {
  const { dict, lang } = useLanguage();
  useDialog(onClose);

  const outcome = getResultOutcome(result);
  const statusText = translateStatus(result.status, lang, leaderLaps - Number(result.laps));
  const grid = parseInt(result.grid);
  const gained = grid > 0 ? grid - parseInt(result.position) : 0;
  const isPurpleLap = result.FastestLap?.rank === "1";

  const tile = "rounded-xl border border-zinc-800/70 bg-zinc-950/50 px-3 py-3 flex flex-col items-center text-center min-w-0";
  const label = "text-[10px] font-bold uppercase tracking-wider text-muted mb-1";

  // Renderizado direto no <body>: nenhum container da página interfere na posição do modal
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-white" role="dialog" aria-modal="true" aria-label={`${result.Driver.givenName} ${result.Driver.familyName}`}>
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

        <span className="block text-red-500 font-bold uppercase tracking-widest text-[10px] pr-10 truncate">{raceName}</span>
        <div className="flex items-center gap-3 mt-2 mb-5 pr-10">
          <span className="font-black text-3xl text-white">{outcome === "classified" ? `${result.position}º` : OUTCOME_LABEL[outcome]}</span>
          <div className="flex flex-col min-w-0">
            <span className="text-lg text-zinc-200 leading-tight truncate">
              {result.Driver.givenName} <span className="font-bold uppercase text-white">{result.Driver.familyName}</span>
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`https://flagcdn.com/w40/${nationalityToISO(result.Driver.nationality)}.png`} alt="" className="w-3.5 h-auto rounded-[2px]" />
              <Image src={getConstructorLogo(result.Constructor.constructorId)} alt="" width={16} height={16} className="w-4 h-4 object-contain" />
              {result.Constructor.name}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className={tile}>
            <span className={label}>{dict.results.start}</span>
            <span className="font-mono text-lg font-bold text-white">{grid === 0 ? "—" : `P${result.grid}`}</span>
            {grid === 0 ? (
              <span className="text-xs text-purple-400 mt-0.5">{dict.results.pitLane}</span>
            ) : gained > 0 ? (
              <span className="text-xs text-green-500 font-bold mt-0.5">+{gained} {dict.results.positions}</span>
            ) : gained < 0 ? (
              <span className="text-xs text-red-500 font-bold mt-0.5">{gained} {dict.results.positions}</span>
            ) : (
              <span className="text-xs text-muted mt-0.5">{dict.results.keptPosition}</span>
            )}
          </div>

          <div className={tile}>
            <span className={label}>{dict.results.pts}</span>
            <span className="font-mono text-lg font-bold text-red-500">{Number(result.points) > 0 ? `+${result.points}` : "0"}</span>
            <span className="text-xs text-muted mt-0.5">{statusText}</span>
          </div>

          <div className={tile}>
            <span className={label}>{dict.results.totalTime}</span>
            <span className="font-mono text-sm font-bold text-zinc-200 break-all">{result.Time ? result.Time.time : statusText}</span>
            <span className="text-xs text-muted mt-0.5">{result.laps} {dict.results.laps}</span>
          </div>

          <div className={tile}>
            <span className={label}>{dict.results.fastestLap}</span>
            {result.FastestLap ? (
              <>
                <span className={`font-mono text-sm font-bold ${isPurpleLap ? "text-purple-400" : "text-zinc-200"}`}>{result.FastestLap.Time.time}</span>
                <span className="text-xs text-muted mt-0.5">
                  {dict.results.lap} {result.FastestLap.lap}
                  {result.FastestLap.AverageSpeed && ` • ${result.FastestLap.AverageSpeed.speed} km/h`}
                </span>
              </>
            ) : (
              <span className="font-mono text-sm text-muted">—</span>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
