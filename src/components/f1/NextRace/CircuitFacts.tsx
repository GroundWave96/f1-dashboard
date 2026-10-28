"use client";

import React from "react";
import { loadCircuitHistory } from "../../../lib/circuit";
import { useAsyncData } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";

interface CircuitFactsProps {
  circuitId: string;
  className?: string;
}

/** "Sobre o circuito": números do histórico da pista, mostrados quando a tela tem altura sobrando. */
export default function CircuitFacts({ circuitId, className = "" }: CircuitFactsProps) {
  const { dict } = useLanguage();
  const { data } = useAsyncData(`circuit:${circuitId}`, () => loadCircuitHistory(circuitId));

  // Circuito novo, ainda sem nenhuma corrida disputada: não há histórico para mostrar
  if (!data || data.total === 0) return null;

  const facts = [
    { label: dict.nextRace.gpsHere, value: String(data.total) },
    { label: dict.nextRace.firstGp, value: data.firstSeason },
    data.lastLaps && { label: `${dict.nextRace.laps} (${data.lastSeason})`, value: data.lastLaps },
    // Rótulo curto para caber inteiro; o ano vai junto do piloto na linha de baixo
    data.fastest && { label: dict.nextRace.fastestLap, value: data.fastest.time, detail: `${data.fastest.driver} • ${data.lastSeason}` },
  ].filter(Boolean) as { label: string; value?: string; detail?: string }[];

  return (
    <div className={`w-full max-w-xl lg:max-w-2xl flex-col gap-2 ${className}`}>
      <span className="text-[10px] font-bold text-muted uppercase tracking-widest">{dict.nextRace.circuitFacts}</span>
      <dl className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${facts.length}, minmax(0, 1fr))` }}>
        {facts.map((fact) => (
          <div key={fact.label} className="rounded-md border border-zinc-800/40 bg-zinc-950/30 px-2.5 py-2 desk-tall:min-h-[4.25rem] flex flex-col justify-center min-w-0">
            <dt className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted truncate">{fact.label}</dt>
            <dd className="font-mono text-sm sm:text-base font-bold text-white leading-tight truncate">{fact.value}</dd>
            {fact.detail && <dd className="text-[10px] text-zinc-400 uppercase truncate">{fact.detail}</dd>}
          </div>
        ))}
      </dl>
    </div>
  );
}
