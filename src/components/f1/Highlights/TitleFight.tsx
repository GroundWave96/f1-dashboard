"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ConstructorStanding, DriverStanding, Race } from "../../../types/f1";
import { computeTitleFight, getRemainingEvents, maxPointsAvailable } from "../../../lib/championship";
import { getConstructorLogo } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import { TrophyIcon } from "../../ui/icons";
import SegmentedControl from "../../ui/SegmentedControl";

interface TitleFightProps {
  season: string;
  calendar: Race[];
  standingsRound: number;
  drivers: DriverStanding[];
  constructors: ConstructorStanding[];
  now: number;
}

const MAX_ROWS = 6;

export default function TitleFight({ season, calendar, standingsRound, drivers, constructors, now }: TitleFightProps) {
  const { dict } = useLanguage();
  const [kind, setKind] = useState<"drivers" | "constructors">("drivers");

  // Nome e logo de cada participante, indexados pelo id
  const info = new Map(
    kind === "drivers"
      ? drivers.map((s) => {
          const team = s.Constructors[s.Constructors.length - 1];
          return [s.Driver.driverId, { name: s.Driver.familyName, full: `${s.Driver.givenName} ${s.Driver.familyName}`, logo: team?.constructorId }];
        })
      : constructors.map((s) => [s.Constructor.constructorId, { name: s.Constructor.name, full: s.Constructor.name, logo: s.Constructor.constructorId }])
  );
  const entries =
    kind === "drivers"
      ? drivers.map((s) => ({ id: s.Driver.driverId, points: Number(s.points) }))
      : constructors.map((s) => ({ id: s.Constructor.constructorId, points: Number(s.points) }));

  const remaining = getRemainingEvents(calendar, standingsRound, now);
  const available = maxPointsAvailable(season, remaining, kind);
  const { contenders, leaderPoints, clinched } = computeTitleFight(entries, available);

  const alive = contenders.filter((c) => c.alive);
  const shown = alive.slice(0, MAX_ROWS);
  // Completa as linhas com quem já está fora da disputa (aparece apagado), para dar contexto
  const eliminated = contenders.filter((c) => !c.alive);
  const rows = [...shown, ...eliminated.slice(0, Math.max(1, MAX_ROWS - shown.length))];
  const hiddenAlive = alive.length - shown.length;
  const scale = Math.max(...rows.map((c) => c.maxPoints), 1);
  const leader = contenders[0] ? info.get(contenders[0].id) : undefined;
  const seasonDone = remaining.races === 0 && remaining.sprints === 0;

  const summary = [
    `${remaining.races} ${remaining.races === 1 ? dict.highlights.raceLeft : dict.highlights.racesLeft}`,
    remaining.sprints > 0 ? `${remaining.sprints} ${remaining.sprints === 1 ? dict.highlights.sprintLeft : dict.highlights.sprintsLeft}` : null,
    `${available} ${dict.highlights.ptsAvailable}`,
  ].filter(Boolean).join(" • ");

  return (
    <div className="h-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl p-4 sm:p-6 flex flex-col gap-[clamp(0.75rem,2vh,1.25rem)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col min-w-0">
          <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.highlights.titleFight}</span>
          <span className="text-xs text-zinc-400 mt-1">{seasonDone ? `${dict.standings.season} ${season}` : summary}</span>
        </div>
        <SegmentedControl
          size="sm"
          className="w-40 shrink-0"
          value={kind}
          onChange={setKind}
          options={[
            { value: "drivers", label: dict.standings.drivers },
            { value: "constructors", label: dict.standings.teams },
          ]}
        />
      </div>

      {clinched && leader && (
        <div className="flex items-center gap-3 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-2.5">
          <TrophyIcon className="w-6 h-6 text-yellow-400 shrink-0" />
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-400">
              {seasonDone ? dict.highlights.champion : dict.highlights.clinched}
            </span>
            <span className="text-sm font-bold text-white uppercase truncate">{leader.full}</span>
          </div>
        </div>
      )}

      <ol className="flex flex-col flex-1 justify-evenly gap-[clamp(0.5rem,1.6vh,0.9rem)]">
        {rows.map((c, index) => {
          const meta = info.get(c.id);
          const isLeader = index === 0;
          const color = !c.alive ? "bg-zinc-600" : isLeader ? "bg-red-500" : "bg-zinc-300";
          return (
            <li key={c.id} className={`grid grid-cols-[1.25rem_minmax(0,6.5rem)_1fr_3rem] sm:grid-cols-[1.25rem_8.5rem_1fr_3.5rem] items-center gap-2 sm:gap-3 ${c.alive ? "" : "opacity-50"} ${index >= 3 ? "hide-short" : ""}`}>
              <span className="text-xs font-bold text-muted text-right">{contenders.indexOf(c) + 1}</span>
              <div className="flex items-center gap-2 min-w-0">
                {meta?.logo && (
                  <Image src={getConstructorLogo(meta.logo)} alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain shrink-0 brightness-110" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-xs sm:text-sm font-bold text-white uppercase truncate" title={meta?.full}>{meta?.name}</span>
                  <span className={`text-[10px] truncate ${!c.alive ? "text-muted" : isLeader ? "text-red-400" : "text-muted"}`}>
                    {!c.alive ? dict.highlights.eliminated : isLeader ? dict.highlights.leader : `-${c.gap} ${dict.standings.pts.toLowerCase()}`}
                  </span>
                </div>
              </div>
              <div className="relative h-2.5 rounded-full bg-zinc-800/70" aria-hidden="true">
                {/* As barras "enchem" da esquerda quando a seção aparece */}
                <div className="grow-x absolute inset-0" style={{ "--i": index } as React.CSSProperties}>
                  <div className={`absolute inset-y-0 left-0 rounded-full opacity-25 ${color}`} style={{ width: `${(c.maxPoints / scale) * 100}%` }} />
                  <div className={`absolute inset-y-0 left-0 rounded-full ${color}`} style={{ width: `${(c.points / scale) * 100}%` }} />
                </div>
                <div className="absolute -top-1.5 -bottom-1.5 border-l border-dashed border-white/40" style={{ left: `${(leaderPoints / scale) * 100}%` }} />
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-mono font-bold text-white">{c.points}</span>
                {available > 0 && <span className="text-[9px] font-mono text-muted whitespace-nowrap">{dict.highlights.maxPossible} {c.maxPoints}</span>}
              </div>
            </li>
          );
        })}
      </ol>

      {hiddenAlive > 0 && (
        <span className="text-[11px] text-muted">+{hiddenAlive} {dict.highlights.othersAlive}</span>
      )}
      <p className="text-[10px] text-muted leading-relaxed border-t border-zinc-800/60 pt-3 hide-short">{dict.highlights.tiebreakNote}</p>
    </div>
  );
}
