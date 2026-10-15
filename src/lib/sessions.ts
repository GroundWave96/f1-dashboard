import type { Race, Session } from "../types/f1";

export type SessionKey = "fp1" | "fp2" | "fp3" | "sprintQualifying" | "sprint" | "qualifying" | "race";

export interface RaceSession {
  key: SessionKey;
  start: Date;
  end: Date;
}

// Duração aproximada de cada sessão, usada para saber quando ela está "ao vivo"
const DURATION_MIN: Record<SessionKey, number> = {
  fp1: 60,
  fp2: 60,
  fp3: 60,
  sprintQualifying: 45,
  sprint: 60,
  qualifying: 60,
  race: 120,
};

// Depois da largada, por quanto tempo a corrida ainda conta como "o fim de semana atual"
const WEEKEND_GRACE_MS = 3 * 60 * 60 * 1000;

export const toDate = (date: string, time?: string) => new Date(`${date}T${time || "00:00:00Z"}`);

export const getRaceStart = (race: Race) => toDate(race.date, race.time);

export function getRaceSessions(race: Race): RaceSession[] {
  const entries: [SessionKey, Session | undefined][] = [
    ["fp1", race.FirstPractice],
    ["fp2", race.SecondPractice],
    ["fp3", race.ThirdPractice],
    ["sprintQualifying", race.SprintQualifying ?? race.SprintShootout],
    ["sprint", race.Sprint],
    ["qualifying", race.Qualifying],
    ["race", { date: race.date, time: race.time }],
  ];

  return entries
    .filter((entry): entry is [SessionKey, Session] => Boolean(entry[1]?.date))
    .map(([key, session]) => {
      const start = toDate(session.date, session.time);
      return { key, start, end: new Date(start.getTime() + DURATION_MIN[key] * 60_000) };
    })
    .sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const isWeekendOver = (race: Race, now: number) => now >= getRaceStart(race).getTime() + WEEKEND_GRACE_MS;

/** Fim de semana em andamento: do início do primeiro treino até algumas horas depois da corrida. */
export const isWeekendActive = (race: Race, now: number) => {
  const first = getRaceSessions(race)[0];
  return Boolean(first) && first.start.getTime() <= now && !isWeekendOver(race, now);
};

export type WeekendState =
  | { kind: "upcoming"; session: RaceSession }
  | { kind: "live"; session: RaceSession; next?: RaceSession }
  | { kind: "finished" };

export function getWeekendState(sessions: RaceSession[], now: number): WeekendState {
  const next = sessions.find((s) => s.start.getTime() > now);
  const live = sessions.find((s) => s.start.getTime() <= now && now < s.end.getTime());
  if (live) return { kind: "live", session: live, next };
  if (next) return { kind: "upcoming", session: next };
  return { kind: "finished" };
}
