/**
 * Sincronização periódica (Worker f1dash-sync, a cada 10 minutos).
 *
 * 1. Mantém frescos os dados que o site usa logo ao abrir (calendário, campeonato, resultados).
 * 2. Depois de cada treino, qualificação ou corrida, guarda os dados da sessão do OpenF1
 *    (liberados no plano gratuito 30 minutos depois do fim).
 * 3. Renova o que venceu e algum visitante pediu nos últimos 2 dias.
 *
 * O plano gratuito limita cada execução a ~50 consultas ao banco e requisições externas,
 * então cada rodada busca no máximo MAX_FETCHES itens; o resto fica para a próxima.
 */
import { type CacheEnv, type CacheRequest, cacheKey, DAY, getOrFetch, MINUTE, requestFromKey, RULINGS_SETTLE, UpstreamError } from "./cache";

const errorCode = (error: unknown) => (error instanceof UpstreamError ? error.status : "erro");

const MAX_FETCHES = 10;

const jolpica = (path: string, query = ""): CacheRequest => ({ source: "jolpica", path, query });

const SEEDS: CacheRequest[] = [
  jolpica("current.json"),
  jolpica("current/next.json"),
  jolpica("current/driverStandings.json", "limit=100"),
  jolpica("current/constructorStandings.json", "limit=100"),
  jolpica("current/results.json", "limit=100&offset=0"),
  jolpica("current/sprint.json", "limit=100&offset=0"),
  jolpica("current/qualifying.json", "limit=100&offset=0"),
];

// O que guardar de cada sessão encerrada (o grid de largada fica junto da qualificação)
const SESSION_ENDPOINTS = ["drivers", "session_result", "laps", "stints", "pit", "weather", "race_control"];
const QUALIFYING_ENDPOINTS = [...SESSION_ENDPOINTS, "starting_grid"];
const isQualifying = (name: string) => /^(qualifying|sprint qualifying|sprint shootout)$/i.test(name);

interface Session {
  session_key: number;
  session_name: string;
  date_start: string;
  date_end: string;
}

interface Candidate {
  req: CacheRequest;
  sessionEnd?: number;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function runSync(env: CacheEnv) {
  const startedAt = Date.now();
  const { meta } = await env.DB.prepare("INSERT INTO sync_runs (started_at) VALUES (?)").bind(startedAt).run();
  let fetched = 0;
  let failed = 0;
  const notes: string[] = [];

  // Sessões do ano, para saber quais acabaram de terminar
  const year = new Date(startedAt).getUTCFullYear();
  let sessions: Session[] = [];
  try {
    const result = await getOrFetch(env, { source: "openf1", path: "sessions", query: `year=${year}` }, { touch: false });
    if (result.state !== "hit") fetched++;
    sessions = JSON.parse(result.body) as Session[];
  } catch (error) {
    failed++;
    notes.push(`openf1:sessions (${errorCode(error)})`);
  }

  // Plano gratuito: de 30 min antes a 30 min depois de cada sessão o OpenF1 bloqueia todas as consultas
  const openF1Blocked = sessions.some(
    (session) => Date.parse(session.date_start) - 30 * MINUTE < startedAt && startedAt < Date.parse(session.date_end) + 35 * MINUTE,
  );
  if (openF1Blocked) notes.push("OpenF1 bloqueado (sessão ao vivo)");

  // Sessões encerradas cujos dados ainda podem mudar (punições): os já consolidados ficam válidos e não voltam à fila
  const recent = sessions.filter((session) => {
    const end = Date.parse(session.date_end);
    return end + 35 * MINUTE < startedAt && startedAt < end + RULINGS_SETTLE;
  });

  // OpenF1 primeiro: no plano gratuito ele só fica aberto entre uma sessão e outra do fim de semana,
  // e o que ficar guardado aparece no site durante o próximo bloqueio
  const openF1: Candidate[] = openF1Blocked
    ? []
    : [
        ...recent.flatMap((session) =>
          (isQualifying(session.session_name) ? QUALIFYING_ENDPOINTS : SESSION_ENDPOINTS).map((path) => ({
            req: { source: "openf1", path, query: `session_key=${session.session_key}` } as CacheRequest,
            sessionEnd: Date.parse(session.date_end),
          })),
        ),
        { req: { source: "openf1", path: "meetings", query: `year=${year}` } },
      ];
  const candidates: Candidate[] = [...openF1, ...SEEDS.map((req) => ({ req }))];

  // Quais candidatos faltam no banco ou já venceram (uma consulta só)
  const keys = candidates.map((candidate) => cacheKey(candidate.req));
  const { results: known } = await env.DB.prepare(`SELECT key, expires_at FROM cache WHERE key IN (${keys.map(() => "?").join(",")})`)
    .bind(...keys)
    .all<{ key: string; expires_at: number }>();
  const fresh = new Set(known.filter((row) => row.expires_at > startedAt).map((row) => row.key));
  const due = candidates.filter((candidate) => !fresh.has(cacheKey(candidate.req)));

  // Dados vencidos que algum visitante pediu recentemente
  const { results: requested } = await env.DB.prepare(
    "SELECT key FROM cache WHERE immutable = 0 AND expires_at < ? AND last_access > ? ORDER BY last_access DESC LIMIT ?",
  )
    .bind(startedAt, startedAt - 2 * DAY, MAX_FETCHES)
    .all<{ key: string }>();
  for (const { key } of requested) {
    const req = requestFromKey(key);
    if (!keys.includes(key) && !(openF1Blocked && req.source === "openf1")) due.push({ req });
  }

  for (const candidate of due.slice(0, MAX_FETCHES)) {
    try {
      await getOrFetch(env, candidate.req, { force: true, touch: false, sessionEnd: candidate.sessionEnd });
      fetched++;
    } catch (error) {
      failed++;
      notes.push(`${cacheKey(candidate.req)} (${errorCode(error)})`);
    }
    // Respeita os limites da Jolpica (4 por segundo) e do OpenF1 gratuito (3 por segundo e 30 por minuto;
    // o endereço de saída da Cloudflare é compartilhado, então folga extra)
    await sleep(candidate.req.source === "openf1" ? 2100 : 400);
  }
  if (due.length > MAX_FETCHES) notes.push(`${due.length - MAX_FETCHES} ficaram para a próxima execução`);

  await env.DB.batch([
    env.DB.prepare("UPDATE sync_runs SET finished_at = ?, fetched = ?, failed = ?, note = ? WHERE id = ?").bind(
      Date.now(),
      fetched,
      failed,
      notes.join(" | ").slice(0, 1000) || null,
      meta.last_row_id,
    ),
    env.DB.prepare("DELETE FROM sync_runs WHERE started_at < ?").bind(startedAt - 7 * DAY),
  ]);
}
