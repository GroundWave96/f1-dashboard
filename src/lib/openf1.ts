/**
 * Dados das sessões (treinos, qualificação, corrida) do OpenF1, lidos pela API do site
 * (/api/openf1, cópia no banco da Cloudflare). Disponíveis de 2023 para cá.
 *
 * No plano gratuito do OpenF1 os dados de cada sessão aparecem ~30 minutos depois do fim dela.
 */

const SITE_API = "/api/openf1/";
const OPENF1 = "https://api.openf1.org/v1/";

export interface OF1Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  meeting_key: number;
  circuit_short_name: string;
  country_name: string;
  country_code: string;
  location: string;
  year: number;
  is_cancelled?: boolean;
}

export interface OF1Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name?: string;
  country_name: string;
  country_code: string;
  location: string;
  circuit_short_name: string;
  date_start: string;
  year: number;
}

export interface OF1Driver {
  driver_number: number;
  name_acronym: string;
  full_name: string;
  first_name: string;
  last_name: string;
  team_name: string | null;
  team_colour: string | null;
  headshot_url: string | null;
}

export interface OF1Lap {
  driver_number: number;
  lap_number: number;
  date_start: string | null;
  lap_duration: number | null;
  duration_sector_1: number | null;
  duration_sector_2: number | null;
  duration_sector_3: number | null;
  st_speed: number | null;
  i1_speed: number | null;
  i2_speed: number | null;
  is_pit_out_lap: boolean;
}

export interface OF1Stint {
  driver_number: number;
  stint_number: number;
  compound: string | null;
  lap_start: number | null;
  lap_end: number | null;
  tyre_age_at_start: number | null;
}

export interface OF1Result {
  driver_number: number;
  position: number | null;
  number_of_laps: number | null;
  // Treinos/corrida: número; qualificação: [Q1, Q2, Q3]
  duration: number | (number | null)[] | null;
  gap_to_leader: number | string | (number | string | null)[] | null;
  dnf?: boolean;
  dns?: boolean;
  dsq?: boolean;
}

export interface OF1Grid {
  driver_number: number;
  position: number | null;
}

export interface OF1Pit {
  driver_number: number;
  lap_number: number;
  date: string;
  // Tempo com o carro parado / tempo total no pit lane
  stop_duration: number | null;
  lane_duration: number | null;
}

export interface OF1RaceControl {
  date: string;
  lap_number: number | null;
  category: string;
  flag: string | null;
  driver_number: number | null;
  qualifying_phase: number | null;
  message: string;
}

export interface OF1Position {
  date: string;
  driver_number: number;
  position: number;
}

export interface OF1Weather {
  date: string;
  air_temperature: number | null;
  track_temperature: number | null;
  rainfall: number | null;
}

export interface OF1CarData {
  date: string;
  speed: number;
  throttle: number;
  brake: number;
  n_gear: number;
}

export interface OF1Location {
  date: string;
  x: number;
  y: number;
}

/** A fonte recusou os dados. status 401 = plano gratuito bloqueado durante uma sessão ao vivo. */
export class OpenF1Unavailable extends Error {
  constructor(
    public status: number,
    path: string,
  ) {
    super(`OpenF1 indisponível (${status}) para ${path}`);
  }

  // Também acontece quando a sessão atrasa ou tem bandeira vermelha e passa do horário previsto
  get liveLock() {
    return this.status === 401;
  }
}

async function openF1<T>(endpoint: string, query: string): Promise<T> {
  const path = `${endpoint}?${query}`;
  try {
    const res = await fetch(`${SITE_API}${path}`);
    const isJson = res.headers.get("content-type")?.includes("json");
    if (res.ok && isJson) return (await res.json()) as T;
    // A API do site respondeu, mas a fonte está indisponível (ex.: sessão ao vivo no plano gratuito):
    // ir direto ao OpenF1 daria o mesmo resultado
    if (isJson) {
      const body = (await res.json().catch(() => null)) as { status?: number } | null;
      throw new OpenF1Unavailable(body?.status ?? res.status, path);
    }
  } catch (error) {
    if (error instanceof OpenF1Unavailable) throw error;
    // API do site inexistente (ex.: next dev): segue direto para o OpenF1
  }
  const res = await fetch(`${OPENF1}${path}`);
  if (res.status === 404) return [] as T;
  if (!res.ok) throw new OpenF1Unavailable(res.status, path);
  return (await res.json()) as T;
}

export type SessionKind = "fp1" | "fp2" | "fp3" | "sprintQualifying" | "sprint" | "qualifying" | "race";

/** "Practice 1" → fp1, "Sprint Qualifying"/"Sprint Shootout" → sprintQualifying... (null = testes de pré-temporada) */
export function sessionKind(session: Pick<OF1Session, "session_name">): SessionKind | null {
  const name = session.session_name.toLowerCase();
  if (name === "practice 1") return "fp1";
  if (name === "practice 2") return "fp2";
  if (name === "practice 3") return "fp3";
  if (name.startsWith("sprint q") || name.startsWith("sprint shootout")) return "sprintQualifying";
  if (name === "sprint") return "sprint";
  if (name === "qualifying") return "qualifying";
  if (name === "race") return "race";
  return null;
}

export const isQualifyingKind = (kind: SessionKind | null) => kind === "qualifying" || kind === "sprintQualifying";
export const isRaceKind = (kind: SessionKind | null) => kind === "race" || kind === "sprint";

/**
 * Sessão de onde vem o grid de largada (o OpenF1 guarda o grid junto da qualificação):
 * a própria qualificação, ou a qualificação da etapa quando a sessão é a corrida (Sprint: a Qualificação Sprint).
 */
export function gridSessionFor(session: OF1Session, sessions: OF1Session[]): number | null {
  const kind = sessionKind(session);
  const target = kind === "qualifying" || kind === "race" ? "qualifying" : kind === "sprintQualifying" || kind === "sprint" ? "sprintQualifying" : null;
  if (!target) return null;
  return sessions.find((s) => s.meeting_key === session.meeting_key && sessionKind(s) === target)?.session_key ?? null;
}

// No plano gratuito os dados ficam bloqueados de 30 min antes a 30 min depois de cada sessão
export const DATA_DELAY_MS = 35 * 60_000;
export const sessionDataReady = (session: OF1Session, now: number) => Date.parse(session.date_end) + DATA_DELAY_MS < now;
export const sessionIsLive = (session: OF1Session, now: number) =>
  Date.parse(session.date_start) <= now && now < Date.parse(session.date_end);

/** Sessões e etapas do ano (se o ano ainda não teve nenhuma sessão, usa o anterior). */
export async function loadSeasonSessions(now: number) {
  const year = new Date(now).getUTCFullYear();
  for (const y of [year, year - 1]) {
    const [sessions, meetings] = await Promise.all([
      openF1<OF1Session[]>("sessions", `year=${y}`),
      openF1<OF1Meeting[]>("meetings", `year=${y}`),
    ]);
    const available = sessions.filter((s) => !s.is_cancelled && sessionDataReady(s, now));
    if (available.length) return { year: y, sessions: sessions.filter((s) => !s.is_cancelled), meetings };
  }
  return { year, sessions: [] as OF1Session[], meetings: [] as OF1Meeting[] };
}

export interface DriverSummary {
  driver: OF1Driver;
  color: string;
  position: number;
  laps: number;
  bestLap: number | null;
  bestLapNumber: number | null;
  // Início e setores da melhor volta (para a comparação de telemetria)
  bestLapStart: string | null;
  bestLapSectors: (number | null)[];
  sectors: (number | null)[];
  theoretical: number | null;
  topSpeed: number | null;
  compound: string | null;
  qualifying: (number | null)[] | null;
  // Qualificação: o Q que definiu a posição (0 = Q1, 1 = Q2, 2 = Q3) e o tempo nele
  qualiStage: number | null;
  qualiTime: number | null;
  raceTime: number | null;
  raceGap: number | string | null;
  status: "dnf" | "dns" | "dsq" | null;
  // Posição no grid de largada (depois das punições); null quando o grid não está disponível
  grid: number | null;
}

export interface SessionData {
  rows: DriverSummary[];
  fastest: { lap: number; driver: OF1Driver } | null;
  bestSectors: ({ time: number; driver: OF1Driver } | null)[];
  theoretical: number | null;
  hasData: boolean;
  hasGrid: boolean;
  laps: OF1Lap[];
  stints: OF1Stint[];
}

const min = (values: (number | null)[]) => {
  const valid = values.filter((v): v is number => typeof v === "number" && v > 0);
  return valid.length ? Math.min(...valid) : null;
};

export const teamColor = (driver: OF1Driver) => (driver.team_colour ? `#${driver.team_colour.replace(/^#/, "")}` : "#71717a");

export async function loadSessionData(sessionKey: number, gridSessionKey: number | null = null): Promise<SessionData> {
  const query = `session_key=${sessionKey}`;
  const [drivers, laps, stints, results, grid] = await Promise.all([
    openF1<OF1Driver[]>("drivers", query),
    openF1<OF1Lap[]>("laps", query),
    openF1<OF1Stint[]>("stints", query),
    openF1<OF1Result[]>("session_result", query),
    // O grid só sai perto da corrida; se falhar, a página aparece sem ele
    gridSessionKey ? openF1<OF1Grid[]>("starting_grid", `session_key=${gridSessionKey}`).catch(() => [] as OF1Grid[]) : Promise.resolve([] as OF1Grid[]),
  ]);

  const resultBy = new Map(results.map((r) => [r.driver_number, r]));
  const gridBy = new Map(grid.map((g) => [g.driver_number, g.position]));

  const rows = drivers.map((driver): DriverSummary => {
    const own = laps.filter((lap) => lap.driver_number === driver.driver_number);
    const timed = own.filter((lap) => lap.lap_duration && !lap.is_pit_out_lap);
    const best = timed.reduce<OF1Lap | null>((acc, lap) => (!acc || (lap.lap_duration ?? Infinity) < (acc.lap_duration ?? Infinity) ? lap : acc), null);
    const sectors = [
      min(own.map((lap) => lap.duration_sector_1)),
      min(own.map((lap) => lap.duration_sector_2)),
      min(own.map((lap) => lap.duration_sector_3)),
    ];
    const result = resultBy.get(driver.driver_number);
    const qualifying = Array.isArray(result?.duration) ? result.duration : null;
    let qualiStage: number | null = null;
    qualifying?.forEach((time, stage) => {
      if (time != null) qualiStage = stage;
    });
    const driverStints = stints.filter((s) => s.driver_number === driver.driver_number);
    // Pneu da melhor volta (treinos/quali) ou do último stint (corrida)
    const stint = best
      ? driverStints.find((s) => (s.lap_start ?? 0) <= best.lap_number && best.lap_number <= (s.lap_end ?? Infinity))
      : driverStints.at(-1);

    return {
      driver,
      color: teamColor(driver),
      position: result?.position ?? 99,
      laps: result?.number_of_laps ?? own.length,
      bestLap: best?.lap_duration ?? null,
      bestLapNumber: best?.lap_number ?? null,
      bestLapStart: best?.date_start ?? null,
      bestLapSectors: best ? [best.duration_sector_1, best.duration_sector_2, best.duration_sector_3] : [null, null, null],
      sectors,
      theoretical: sectors.every((s) => s !== null) ? sectors.reduce((a, b) => a! + b!, 0) : null,
      topSpeed: Math.max(0, ...own.map((lap) => lap.st_speed ?? 0)) || null,
      compound: stint?.compound ?? null,
      qualifying,
      qualiStage,
      qualiTime: qualiStage === null ? null : (qualifying?.[qualiStage] ?? null),
      raceTime: typeof result?.duration === "number" ? result.duration : null,
      raceGap: Array.isArray(result?.gap_to_leader) ? null : (result?.gap_to_leader ?? null),
      status: result?.dsq ? "dsq" : result?.dns ? "dns" : result?.dnf ? "dnf" : null,
      grid: gridBy.get(driver.driver_number) ?? null,
    };
  });

  // Ordem oficial quando existe; senão, pela melhor volta
  rows.sort((a, b) => a.position - b.position || (a.bestLap ?? Infinity) - (b.bestLap ?? Infinity));
  if (!results.length) rows.forEach((row, index) => (row.position = index + 1));

  const fastestRow = rows.filter((r) => r.bestLap).sort((a, b) => a.bestLap! - b.bestLap!)[0];
  const bestSectors = [0, 1, 2].map((i) => {
    const row = rows.filter((r) => r.sectors[i]).sort((a, b) => a.sectors[i]! - b.sectors[i]!)[0];
    return row ? { time: row.sectors[i]!, driver: row.driver } : null;
  });

  return {
    rows,
    fastest: fastestRow ? { lap: fastestRow.bestLap!, driver: fastestRow.driver } : null,
    bestSectors,
    theoretical: bestSectors.every(Boolean) ? bestSectors.reduce((sum, s) => sum + s!.time, 0) : null,
    hasData: laps.length > 0 || results.length > 0,
    hasGrid: rows.some((row) => row.grid !== null),
    laps,
    stints,
  };
}

export interface SessionExtras {
  pits: OF1Pit[];
  raceControl: OF1RaceControl[];
  positions: OF1Position[];
  weather: OF1Weather[];
}

/**
 * Dados complementares da sessão (paradas, mensagens da direção de prova, clima e, na corrida,
 * as mudanças de posição). Carregados depois da tabela, para não atrasar a página.
 */
export async function loadSessionExtras(sessionKey: number, race: boolean): Promise<SessionExtras> {
  const query = `session_key=${sessionKey}`;
  const [pits, raceControl, positions, weather] = await Promise.all([
    openF1<OF1Pit[]>("pit", query),
    openF1<OF1RaceControl[]>("race_control", query),
    race ? openF1<OF1Position[]>("position", query) : Promise.resolve([] as OF1Position[]),
    openF1<OF1Weather[]>("weather", query),
  ]);
  return { pits, raceControl, positions, weather };
}

// Horário em UTC sem fuso e sem frações ("2026-11-07T20:17:25"), no formato dos filtros do OpenF1
const filterTime = (ms: number) => new Date(ms).toISOString().slice(0, 19);

/** Telemetria (velocidade, acelerador, freio, marcha) e, se pedido, posição na pista de uma volta. */
export async function loadLapTelemetry(sessionKey: number, driverNumber: number, lapStart: string, lapDuration: number, withLocation: boolean) {
  const start = Date.parse(lapStart);
  const range = `date>=${filterTime(start)}&date<${filterTime(start + (lapDuration + 1) * 1000)}`;
  const query = `session_key=${sessionKey}&driver_number=${driverNumber}&${range}`;
  const [car, location] = await Promise.all([
    openF1<OF1CarData[]>("car_data", query),
    withLocation ? openF1<OF1Location[]>("location", query) : Promise.resolve([] as OF1Location[]),
  ]);
  return { start, car, location };
}

/**
 * Mudança de posição ligada ao grid (positivo = subiu). Na qualificação: do resultado para a largada
 * (negativo = punição); na corrida: da largada para a chegada (posições ganhas).
 */
export function gridChange(row: DriverSummary, kind: SessionKind | null): number | null {
  if (row.grid === null || row.position >= 99) return null;
  if (isQualifyingKind(kind)) return row.position - row.grid;
  if (isRaceKind(kind)) return row.status ? null : row.grid - row.position;
  return null;
}

/**
 * Diferença para o pole na qualificação. Só faz sentido entre pilotos do mesmo Q (a pista melhora
 * de um Q para o outro); para quem caiu antes, null.
 */
export function qualiGap(row: DriverSummary, pole: DriverSummary) {
  if (row.qualiStage === null || row.qualiStage !== pole.qualiStage || row.qualiTime === null || pole.qualiTime === null) return null;
  return row.qualiTime - pole.qualiTime;
}

/** Melhor tempo de cada Q (para destacar em roxo). */
export function qualiStageBests(rows: DriverSummary[]) {
  return [0, 1, 2].map((stage) => min(rows.map((row) => row.qualifying?.[stage] ?? null)));
}

/** 71.622 → "1:11.622"; 18.315 → "18.315" */
export function formatLap(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds)) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return m > 0 ? `${m}:${s.toFixed(3).padStart(6, "0")}` : s.toFixed(3);
}

/** Tempo total de corrida: 5716.65 → "1:35:16.650" */
export function formatRaceTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = (seconds % 60).toFixed(3).padStart(6, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** Foto do piloto em resolução maior que a padrão do OpenF1 (1col → 4col). */
export const headshot = (driver: OF1Driver) => driver.headshot_url?.replace("/1col/", "/4col/") ?? null;
