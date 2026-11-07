/**
 * Cópia das APIs de F1 (Jolpica e OpenF1) no banco D1 da Cloudflare.
 * Usada pela API do site (functions/) e pelo Worker de sincronização (worker/).
 *
 * Fluxo: dado válido no banco → devolve na hora; vencido ou ausente → busca na fonte e grava;
 * fonte fora do ar → devolve o último dado guardado, mesmo vencido. Assim o site continua
 * funcionando quando a Jolpica ou o OpenF1 caem ou limitam as requisições.
 */

export type Source = "jolpica" | "openf1";

export interface CacheEnv {
  DB: D1Database;
}

export interface CacheRequest {
  source: Source;
  path: string; // "current/driverStandings.json" ou "laps"
  query: string; // parâmetros já validados e em ordem fixa ("limit=100&offset=0")
}

export interface CachedResponse {
  body: string;
  state: "hit" | "miss" | "stale";
  expiresAt: number;
  immutable: boolean;
}

interface Row {
  body: string;
  expires_at: number;
  immutable: number;
  last_access: number;
}

interface Policy {
  ttl: number;
  immutable: boolean;
}

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

const UPSTREAM: Record<Source, string> = {
  jolpica: "https://api.jolpi.ca/ergast/f1/",
  openf1: "https://api.openf1.org/v1/",
};

// O D1 aceita no máximo 2 MB por linha; respostas maiores passam direto, sem guardar
const MAX_BODY_BYTES = 1_900_000;

const OPENF1_ENDPOINTS = new Set([
  "car_data", "championship_drivers", "championship_teams", "drivers", "intervals", "laps", "location",
  "meetings", "overtakes", "pit", "position", "race_control", "sessions", "session_result",
  "starting_grid", "stints", "team_radio", "weather",
]);
// Telemetria (~3,7 leituras por segundo): sem filtro por piloto uma sessão passa de dezenas de MB
const OPENF1_NEEDS_DRIVER = new Set(["car_data", "location"]);

export class UpstreamError extends Error {
  constructor(public status: number) {
    super(`Fonte respondeu ${status}`);
  }
}

export class BadRequestError extends Error {}

/**
 * Valida o pedido vindo do site e monta a forma canônica (parâmetros em ordem alfabética),
 * para "a=1&b=2" e "b=2&a=1" usarem a mesma linha do banco.
 */
export function parseRequest(source: string, path: string, rawQuery: string): CacheRequest {
  // Partes cruas: o OpenF1 usa filtros como "date>=2026-11-07T15:00:00" (o operador fica no nome)
  const parts = rawQuery.replace(/^\?/, "").split("&").filter(Boolean);
  for (const part of parts) {
    if (!/^[\w.:<>=+%-]+$/.test(part)) throw new BadRequestError(`Parâmetro inválido: ${part}`);
  }
  const query = parts.sort().join("&");

  if (source === "jolpica") {
    if (!/^[\w/]+\.json$/.test(path) || path.includes("..")) throw new BadRequestError("Caminho inválido");
    if (parts.some((part) => !/^(limit|offset)=\d+$/.test(part))) throw new BadRequestError("Só limit e offset são aceitos");
    return { source, path, query };
  }

  if (source === "openf1") {
    if (!OPENF1_ENDPOINTS.has(path)) throw new BadRequestError("Endpoint desconhecido");
    if (OPENF1_NEEDS_DRIVER.has(path) && !parts.some((part) => part.startsWith("driver_number="))) {
      throw new BadRequestError("Telemetria exige driver_number");
    }
    return { source, path, query };
  }

  throw new BadRequestError("Fonte desconhecida");
}

export const cacheKey = (req: CacheRequest) => `${req.source}:${req.path}${req.query ? `?${req.query}` : ""}`;

/** Caminho inverso: transforma uma chave do banco de volta em pedido (usado pelo Worker). */
export function requestFromKey(key: string): CacheRequest {
  const [source, rest] = [key.slice(0, key.indexOf(":")), key.slice(key.indexOf(":") + 1)];
  const [path, query = ""] = rest.split("?");
  return { source: source as Source, path, query };
}

const upstreamUrl = (req: CacheRequest) => `${UPSTREAM[req.source]}${req.path}${req.query ? `?${req.query}` : ""}`;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Os servidores da Cloudflare são compartilhados com outros sites, então a Jolpica às vezes
// responde 429 (limite de requisições) mesmo com pouco uso nosso: vale insistir algumas vezes
const RETRY_DELAYS = [800, 1600];

async function fetchUpstream(req: CacheRequest): Promise<string> {
  let status = 504;
  for (let attempt = 0; ; attempt++) {
    let retryAfter = 0;
    try {
      const res = await fetch(upstreamUrl(req), {
        headers: { accept: "application/json", "user-agent": "f1dash (https://f1dash.pages.dev)" },
        signal: AbortSignal.timeout(12_000),
      });
      if (res.ok) return await res.text();
      // O OpenF1 responde 404 quando a consulta não tem resultados (ex.: sessão que ainda não aconteceu)
      if (res.status === 404 && req.source === "openf1") return "[]";
      status = res.status;
      // 429 = limite de requisições; 5xx = instabilidade. Outros erros não adianta repetir.
      if (status !== 429 && status < 500) break;
      retryAfter = Number(res.headers.get("retry-after")) * 1000 || 0;
    } catch {
      status = 504;
    }
    if (attempt >= RETRY_DELAYS.length) break;
    await sleep(Math.min(Math.max(retryAfter, RETRY_DELAYS[attempt]), 3000));
  }
  throw new UpstreamError(status);
}

/** Fim (epoch ms) das sessões de uma resposta de /sessions ou /meetings. */
export function sessionEnds(body: string): number[] {
  try {
    return (JSON.parse(body) as { date_end?: string }[]).map((s) => Date.parse(s.date_end ?? "")).filter(Number.isFinite);
  } catch {
    return [];
  }
}

/**
 * Por quanto tempo o dado vale. Temporadas e sessões encerradas não mudam mais (30 dias);
 * dados da temporada atual e de sessões recentes são renovados em minutos.
 */
async function policyFor(env: CacheEnv, req: CacheRequest, body: string, now: number, sessionEnd?: number): Promise<Policy> {
  const currentYear = new Date(now).getUTCFullYear();
  const done: Policy = { ttl: 30 * DAY, immutable: true };

  if (req.source === "jolpica") {
    const year = Number(req.path.match(/^(\d{4})(?:\/|\.json)/)?.[1]);
    if (year && year < currentYear) return done;
    if (req.path.startsWith("current") || year === currentYear) return { ttl: 10 * MINUTE, immutable: false };
    // Histórico de pilotos e circuitos: muda no máximo uma vez por fim de semana
    return { ttl: 12 * HOUR, immutable: false };
  }

  const params = new Map(req.query.split("&").map((part) => part.split("=") as [string, string]));
  const year = Number(params.get("year"));
  if (year && year < currentYear) return done;
  // Consulta sem resultado: pode ser uma sessão que ainda não aconteceu, então tenta de novo logo
  if (body.trim() === "[]") return { ttl: 5 * MINUTE, immutable: false };

  if (req.path === "sessions" || req.path === "meetings") {
    const ends = sessionEnds(body);
    if (ends.length && Math.max(...ends) + 2 * HOUR < now) return done;
    return { ttl: req.query.includes("latest") ? 3 * MINUTE : HOUR, immutable: false };
  }

  // Dados de uma sessão: depois de 1h30 do fim o OpenF1 já consolidou tudo
  let end = sessionEnd;
  if (end === undefined) {
    const sessionKey = params.get("session_key");
    const meetingKey = params.get("meeting_key");
    const lookup = sessionKey && /^\d+$/.test(sessionKey) ? `session_key=${sessionKey}` : meetingKey && /^\d+$/.test(meetingKey) ? `meeting_key=${meetingKey}` : null;
    if (lookup) {
      const sessions = await getOrFetch(env, { source: "openf1", path: "sessions", query: lookup }).catch(() => null);
      const ends = sessions ? sessionEnds(sessions.body) : [];
      if (ends.length) end = Math.max(...ends);
    }
  }
  if (end !== undefined && end + 90 * MINUTE < now) return done;
  return { ttl: (req.query.includes("latest") ? 3 : 10) * MINUTE, immutable: false };
}

const inFlight = new Map<string, Promise<CachedResponse>>();

interface FetchOptions {
  // Ignora o dado guardado mesmo que ainda esteja válido
  force?: boolean;
  // Pedido de um visitante (conta como "acesso recente"); o Worker passa false
  touch?: boolean;
  // Fim da sessão já conhecido, para não precisar consultá-lo de novo
  sessionEnd?: number;
  // Tarefas que podem terminar depois da resposta (ctx.waitUntil)
  defer?: (promise: Promise<unknown>) => void;
}

export async function getOrFetch(env: CacheEnv, req: CacheRequest, options: FetchOptions = {}): Promise<CachedResponse> {
  const { force = false, touch = true, defer } = options;
  const key = cacheKey(req);
  const now = Date.now();
  const row = await env.DB.prepare("SELECT body, expires_at, immutable, last_access FROM cache WHERE key = ?").bind(key).first<Row>();

  if (row && !force && row.expires_at > now) {
    // Marca o acesso no máximo 1x por hora, para não gastar escritas no banco a cada visita
    if (touch && now - row.last_access > HOUR) {
      const update = env.DB.prepare("UPDATE cache SET last_access = ? WHERE key = ?").bind(now, key).run();
      if (defer) defer(update);
      else await update;
    }
    return { body: row.body, state: "hit", expiresAt: row.expires_at, immutable: row.immutable === 1 };
  }

  // Vários visitantes pedindo a mesma coisa ao mesmo tempo geram uma única busca na fonte
  let pending = inFlight.get(key);
  if (!pending) {
    pending = refresh(env, req, row, { ...options, touch }).finally(() => inFlight.delete(key));
    inFlight.set(key, pending);
  }
  return pending;
}

async function refresh(env: CacheEnv, req: CacheRequest, row: Row | null, options: FetchOptions): Promise<CachedResponse> {
  const key = cacheKey(req);
  const now = Date.now();

  let body: string;
  try {
    body = await fetchUpstream(req);
  } catch (error) {
    if (!row) throw error;
    // Fonte fora do ar: devolve o último dado e espera um pouco antes de tentar de novo.
    // No plano gratuito o OpenF1 bloqueia tudo (401) durante as sessões ao vivo, que duram até ~2h.
    const retryIn = error instanceof UpstreamError && error.status === 401 ? 10 * MINUTE : 2 * MINUTE;
    await env.DB.prepare("UPDATE cache SET expires_at = ? WHERE key = ?").bind(now + retryIn, key).run();
    return { body: row.body, state: "stale", expiresAt: now + retryIn, immutable: false };
  }

  const policy = await policyFor(env, req, body, now, options.sessionEnd);
  const expiresAt = now + policy.ttl;
  if (new TextEncoder().encode(body).length <= MAX_BODY_BYTES) {
    const lastAccess = options.touch ? now : (row?.last_access ?? now);
    await env.DB.prepare(
      `INSERT INTO cache (key, body, fetched_at, expires_at, immutable, last_access) VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET body = excluded.body, fetched_at = excluded.fetched_at,
         expires_at = excluded.expires_at, immutable = excluded.immutable,
         last_access = MAX(cache.last_access, excluded.last_access)`,
    )
      .bind(key, body, now, expiresAt, policy.immutable ? 1 : 0, lastAccess)
      .run();
  }
  return { body, state: "miss", expiresAt, immutable: policy.immutable };
}
