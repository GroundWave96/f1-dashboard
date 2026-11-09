/**
 * Mensagens da direção de prova (OpenF1 /race_control) transformadas em eventos para a linha do tempo.
 * Das centenas de mensagens de uma corrida, a maioria é rotina (bandeira azul, amarela por setor,
 * pista liberada): ficam só as que explicam o resultado. O texto final é montado no idioma do site.
 */
import type { OF1RaceControl } from "./openf1";

export type RcKind =
  | "start"
  | "finish"
  | "red"
  | "resume"
  | "sc"
  | "scIn"
  | "vsc"
  | "vscEnd"
  | "penalty"
  | "served"
  | "warning"
  | "investigation"
  | "afterSession"
  | "cleared"
  | "rain";

// Tipo de punição: segundos, stop-and-go, drive-through, posições no grid, advertência, desclassificação
export type PenaltyType = { kind: "time"; seconds: number } | { kind: "stopGo" } | { kind: "driveThrough" } | { kind: "grid"; places: number } | { kind: "reprimand" } | { kind: "dsq" };

export interface RcEvent {
  id: number;
  kind: RcKind;
  date: string;
  lap: number | null;
  // Fase da qualificação (1 = Q1...)
  phase: number | null;
  drivers: number[];
  penalty?: PenaltyType;
  // Motivo em inglês, como a FIA escreve (a tradução fica no dicionário)
  reason?: string;
  turn?: number;
  // Risco de chuva (%) ou horário de reinício ("17:12", horário do circuito)
  value?: string;
}

/** Eventos que contam a história da sessão; o resto aparece em "Tudo". */
export const HIGHLIGHT_KINDS: RcKind[] = ["start", "finish", "red", "resume", "sc", "scIn", "vsc", "vscEnd", "penalty", "warning"];

export interface RaceControlSummary {
  events: RcEvent[];
  // Voltas anuladas por piloto (limite de pista ou bandeira amarela dupla)
  deleted: Map<number, number>;
}

const carsIn = (m: string) => [...m.matchAll(/(\d+) \([A-Z]{3}\)/g)].map((match) => Number(match[1]));

function penaltyOf(m: string): PenaltyType | undefined {
  const seconds = m.match(/(\d+) SECOND TIME PENALTY/);
  if (seconds) return { kind: "time", seconds: Number(seconds[1]) };
  if (/STOP[- ]AND[- ]GO|STOP\/GO/.test(m)) return { kind: "stopGo" };
  if (/DRIVE[- ]THROUGH/.test(m)) return { kind: "driveThrough" };
  const grid = m.match(/(\d+) PLACE GRID PENALTY/);
  if (grid) return { kind: "grid", places: Number(grid[1]) };
  if (/REPRIMAND/.test(m)) return { kind: "reprimand" };
  if (/DISQUALIFIED/.test(m)) return { kind: "dsq" };
  return undefined;
}

// Motivo: o que vem depois do último " - " da parte principal, sem o horário "(14:50:05)" no fim
function reasonOf(m: string): string | undefined {
  const clean = m.replace(/\s*\(\d\d:\d\d:\d\d\)\s*$/, "");
  const match = clean.match(/(?:UNDER INVESTIGATION|NO FURTHER ACTION|REVIEWED NO FURTHER INVESTIGATION|WILL BE INVESTIGATED AFTER THE \w+|PENALTY FOR CAR \d+ \([A-Z]{3}\)|FLAG FOR CAR \d+ \([A-Z]{3}\)|DISQUALIFIED|REPRIMAND)\s*-\s*(.+)$/);
  return match?.[1].trim() || undefined;
}

export function parseRaceControl(messages: OF1RaceControl[]): RaceControlSummary {
  const events: RcEvent[] = [];
  const deleted = new Map<number, number>();
  const seen = new Set<string>();
  let rainShown = false;

  const sorted = [...messages].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
  sorted.forEach((msg, index) => {
    const m = (msg.message ?? "").toUpperCase().trim();
    const base = { id: index, date: msg.date, lap: msg.lap_number, phase: msg.qualifying_phase };
    const turn = Number(m.match(/TURN (\d+)/)?.[1]) || undefined;
    let event: RcEvent | null = null;

    if (msg.category === "SessionStatus" && m === "SESSION STARTED") event = { ...base, kind: "start", drivers: [] };
    else if (msg.flag === "CHEQUERED") event = { ...base, kind: "finish", drivers: [] };
    else if (msg.flag === "RED" || /^RED FLAG/.test(m)) event = { ...base, kind: "red", drivers: [] };
    else if (/WILL RESUME AT (\d\d:\d\d)/.test(m)) event = { ...base, kind: "resume", drivers: [], value: m.match(/WILL RESUME AT (\d\d:\d\d)/)![1] };
    else if (/^(VSC|VIRTUAL SAFETY CAR) DEPLOYED/.test(m)) event = { ...base, kind: "vsc", drivers: [] };
    else if (/^(VSC|VIRTUAL SAFETY CAR) ENDING/.test(m)) event = { ...base, kind: "vscEnd", drivers: [] };
    else if (/^SAFETY CAR DEPLOYED/.test(m)) event = { ...base, kind: "sc", drivers: [] };
    else if (/^SAFETY CAR IN THIS LAP/.test(m)) event = { ...base, kind: "scIn", drivers: [] };
    else if (/PENALTY SERVED/.test(m)) event = { ...base, kind: "served", drivers: carsIn(m), penalty: penaltyOf(m), reason: reasonOf(m.replace(/^.*PENALTY SERVED - /, "")) };
    else if (/FOR CAR \d+/.test(m) && penaltyOf(m)) event = { ...base, kind: "penalty", drivers: carsIn(m), penalty: penaltyOf(m), reason: reasonOf(m), turn };
    else if (msg.flag === "BLACK AND WHITE") event = { ...base, kind: "warning", drivers: carsIn(m), reason: reasonOf(m) };
    else if (/FIA STEWARDS/.test(m) && /UNDER INVESTIGATION/.test(m)) event = { ...base, kind: "investigation", drivers: carsIn(m), reason: reasonOf(m), turn };
    else if (/FIA STEWARDS/.test(m) && /WILL BE INVESTIGATED AFTER/.test(m)) event = { ...base, kind: "afterSession", drivers: carsIn(m), reason: reasonOf(m), turn };
    else if (/FIA STEWARDS/.test(m) && /NO FURTHER (ACTION|INVESTIGATION)/.test(m)) event = { ...base, kind: "cleared", drivers: carsIn(m), reason: reasonOf(m), turn };
    else if (/DELETED/.test(m) && /CAR \d+/.test(m)) {
      const car = Number(m.match(/CAR (\d+)/)![1]);
      deleted.set(car, (deleted.get(car) ?? 0) + 1);
    } else if (/RISK OF RAIN .* IS (\d+)%/.test(m) && !rainShown) {
      rainShown = true;
      event = { ...base, kind: "rain", drivers: [], value: m.match(/IS (\d+)%/)![1] };
    }

    if (!event) return;
    // A FIA às vezes repete a mesma mensagem
    const key = `${event.kind}|${event.drivers.join(",")}|${event.reason ?? ""}|${event.lap ?? ""}|${event.value ?? ""}`;
    if (seen.has(key)) return;
    seen.add(key);
    // Mesma decisão para vários pilotos na mesma volta (ex.: cinco investigados pelo mesmo motivo): uma linha só
    const previous = events[events.length - 1];
    if (previous && !event.penalty && previous.kind === event.kind && previous.reason === event.reason && previous.lap === event.lap && event.drivers.length) {
      previous.drivers = [...new Set([...previous.drivers, ...event.drivers])];
      return;
    }
    events.push(event);
  });

  return { events, deleted };
}

/** Voltas de safety car (SC) e de safety car virtual (VSC), para marcar no gráfico de posições. */
export function neutralizedLaps(events: RcEvent[], lastLap: number) {
  const periods: { kind: "sc" | "vsc"; from: number; to: number }[] = [];
  let open: { kind: "sc" | "vsc"; from: number } | null = null;
  for (const event of events) {
    if (event.lap === null) continue;
    if ((event.kind === "sc" || event.kind === "vsc") && !open) open = { kind: event.kind, from: event.lap };
    else if (open && ((open.kind === "sc" && event.kind === "scIn") || (open.kind === "vsc" && event.kind === "vscEnd"))) {
      periods.push({ ...open, to: event.lap });
      open = null;
    }
  }
  if (open) periods.push({ ...open, to: lastLap });
  return periods;
}
