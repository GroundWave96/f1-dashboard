import { Race } from "../types/f1";
import { getRaceStart } from "./sessions";

// ---------- Disputa pelo título ----------

// Até 2024 havia 1 ponto extra pela volta mais rápida
const maxRacePoints = (season: string) => (Number(season) >= 2025 ? 25 : 26);
const MAX_SPRINT_POINTS = 8;

export interface RemainingEvents {
  races: number;
  sprints: number;
}

/**
 * Corridas e sprints que ainda podem dar pontos. Uma etapa conta como restante se ainda não
 * aconteceu OU se ainda não entrou na classificação (a API leva algumas horas para atualizar).
 * Assim o cálculo nunca elimina alguém antes da hora.
 */
export function getRemainingEvents(calendar: Race[], standingsRound: number, now: number): RemainingEvents {
  let races = 0;
  let sprints = 0;
  for (const race of calendar) {
    const notCounted = Number(race.round) > standingsRound;
    if (notCounted || getRaceStart(race).getTime() > now) races++;
    if (race.Sprint) {
      const sprintStart = new Date(`${race.Sprint.date}T${race.Sprint.time || "00:00:00Z"}`).getTime();
      if (notCounted || sprintStart > now) sprints++;
    }
  }
  return { races, sprints };
}

export function maxPointsAvailable(season: string, remaining: RemainingEvents, kind: "drivers" | "constructors") {
  const racePoints = maxRacePoints(season);
  if (kind === "drivers") return remaining.races * racePoints + remaining.sprints * MAX_SPRINT_POINTS;
  // Uma equipe pode fazer 1º e 2º: 25 + 18 na corrida, 8 + 7 na sprint
  return remaining.races * (racePoints + 18) + remaining.sprints * (MAX_SPRINT_POINTS + 7);
}

export interface Contender {
  id: string;
  points: number;
  maxPoints: number;
  gap: number;
  alive: boolean;
}

export function computeTitleFight(entries: { id: string; points: number }[], available: number) {
  const sorted = [...entries].sort((a, b) => b.points - a.points);
  const leaderPoints = sorted[0]?.points ?? 0;
  const contenders: Contender[] = sorted.map((entry) => ({
    id: entry.id,
    points: entry.points,
    maxPoints: entry.points + available,
    gap: leaderPoints - entry.points,
    alive: entry.points + available >= leaderPoints,
  }));
  // Decidido quando nem o segundo colocado alcança o líder
  const clinched = contenders.length > 1 && contenders.filter((c) => c.alive).length === 1;
  return { contenders, leaderPoints, clinched };
}
