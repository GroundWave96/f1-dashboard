"use client";

import React from "react";
import Image from "next/image";
import { ConstructorStanding, Constructor, Driver, DriverStanding } from "../../../types/f1";
import { getConstructorLogo, getPositionStyle, nationalityToISO, translateNationality } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import RankFrame, { rankRowClass } from "../../ui/RankFrame";

interface Row {
  key: string;
  position: string;
  points: number;
  wins: string;
  logo?: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
  // Informação extra mostrada só quando a linha é larga (ex.: os pilotos de cada equipe)
  extra?: React.ReactNode;
  onSelect: () => void;
}

/** Lista de classificação (pilotos ou equipes) com barra de pontos em relação ao líder. */
function RankList({ rows, ariaLabel, short }: { rows: Row[]; ariaLabel: string; short?: boolean }) {
  const { dict } = useLanguage();
  const leaderPoints = Math.max(1, ...rows.map((row) => row.points));

  return (
    <RankFrame count={rows.length} ariaLabel={ariaLabel} short={short}>
        {rows.map((row, index) => (
          <li key={row.key} className="@container min-w-0">
            <button
              type="button"
              onClick={row.onSelect}
              className={rankRowClass}
            >
              <span className={`text-center ${getPositionStyle(row.position)}`}>{row.position}º</span>
              <span className="flex items-center gap-3 min-w-0">
                {row.logo && (
                  <Image src={row.logo} alt="" width={28} height={28} className="w-7 h-7 object-contain shrink-0 brightness-110" />
                )}
                {/* Com informação extra (linha larga), o nome tem largura fixa para as barras começarem todas no mesmo ponto */}
                <span className={`flex flex-col min-w-0 leading-tight ${row.extra ? "@3xl:w-52 @3xl:shrink-0" : ""}`}>
                  <span className="text-sm sm:text-[15px] text-zinc-200 truncate">{row.title}</span>
                  <span className="rank-sub flex items-center gap-1.5 text-[11px] text-muted truncate">{row.subtitle}</span>
                </span>
                {/* Linha larga: barra de pontos em relação ao líder ligando o nome à informação extra */}
                {row.extra && (
                  <span className="hidden @3xl:flex flex-1 items-center gap-6 pr-4 min-w-0">
                    <span aria-hidden="true" className="flex-1 h-1.5 rounded-full bg-zinc-800/80 overflow-hidden">
                      <span
                        className="grow-x block h-full rounded-full bg-linear-to-r from-red-600 to-red-500/60"
                        style={{ width: `${(row.points / leaderPoints) * 100}%`, "--i": index } as React.CSSProperties}
                      />
                    </span>
                    <span className="flex items-center justify-end gap-6 shrink-0 min-w-80">{row.extra}</span>
                  </span>
                )}
              </span>
              <span className="rank-meta flex flex-col items-end leading-tight @3xl:min-w-20">
                <span className="font-mono font-bold text-red-400 text-sm sm:text-base">
                  {row.points}
                  <span className="ml-1 text-[10px] font-sans font-medium text-muted">{dict.standings.pts.toLowerCase()}</span>
                </span>
                {Number(row.wins) > 0 && (
                  <span className="rank-sub text-[10px] text-muted whitespace-nowrap">
                    {row.wins} {Number(row.wins) === 1 ? dict.standings.win : dict.standings.wins.toLowerCase()}
                  </span>
                )}
              </span>
              {/* Barra fina com os pontos em relação ao líder */}
              <span aria-hidden="true" className="absolute left-3 right-3 bottom-0 h-px bg-zinc-800/80">
                <span
                  className={`grow-x block h-full bg-linear-to-r from-red-600/70 to-red-500/30 ${row.extra ? "@3xl:hidden" : ""}`}
                  style={{ width: `${(row.points / leaderPoints) * 100}%`, "--i": index } as React.CSSProperties}
                />
              </span>
            </button>
          </li>
        ))}
    </RankFrame>
  );
}

export function DriverStandingsList({ standings, onSelect }: { standings: DriverStanding[]; onSelect: (driver: Driver, constructorName: string) => void }) {
  const { dict } = useLanguage();
  const rows: Row[] = standings.map((row) => {
    // A Ergast lista as equipes em ordem cronológica; a última é a atual
    const team = row.Constructors[row.Constructors.length - 1];
    return {
      key: row.Driver.driverId,
      position: row.position,
      points: Number(row.points),
      wins: row.wins,
      logo: getConstructorLogo(team?.constructorId),
      title: (
        <>
          {row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
        </>
      ),
      subtitle: (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`} alt="" className="w-3.5 h-auto rounded-[2px] shrink-0" loading="lazy" />
          <span className="truncate">{team?.name ?? dict.standings.noTeam}</span>
        </>
      ),
      onSelect: () => onSelect(row.Driver, team?.name || dict.standings.noTeam),
    };
  });
  return <RankList rows={rows} ariaLabel={dict.standings.drivers} />;
}

interface ConstructorStandingsListProps {
  standings: ConstructorStanding[];
  // Classificação de pilotos da mesma temporada, para mostrar quem pontuou por cada equipe
  drivers?: DriverStanding[];
  onSelect: (constructorData: Constructor) => void;
}

export function ConstructorStandingsList({ standings, drivers = [], onSelect }: ConstructorStandingsListProps) {
  const { dict, lang } = useLanguage();

  // Pilotos agrupados pela equipe atual de cada um (a última da lista da Ergast)
  const driversByTeam = new Map<string, DriverStanding[]>();
  for (const driver of drivers) {
    const teamId = driver.Constructors[driver.Constructors.length - 1]?.constructorId;
    if (teamId) driversByTeam.set(teamId, [...(driversByTeam.get(teamId) ?? []), driver]);
  }

  const rows: Row[] = standings.map((row) => ({
    key: row.Constructor.constructorId,
    position: row.position,
    points: Number(row.points),
    wins: row.wins,
    logo: getConstructorLogo(row.Constructor.constructorId),
    title: <span className="font-bold uppercase text-white">{row.Constructor.name}</span>,
    subtitle: translateNationality(row.Constructor.nationality, lang),
    extra: driversByTeam.get(row.Constructor.constructorId)?.slice(0, 3).map((driver) => (
      <span key={driver.Driver.driverId} className="flex items-baseline gap-1.5 text-xs">
        <span className="font-bold uppercase text-zinc-300">{driver.Driver.familyName}</span>
        <span className="font-mono text-muted">{driver.points}</span>
      </span>
    )),
    onSelect: () => onSelect(row.Constructor),
  }));
  return <RankList rows={rows} ariaLabel={dict.standings.teams} short />;
}
