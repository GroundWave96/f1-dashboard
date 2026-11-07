/**
 * API do site (Cloudflare Pages Functions), em f1dash.pages.dev/api/...
 *
 *   /api/jolpica/current/driverStandings.json?limit=100  → Jolpica (história, campeonato, calendário)
 *   /api/openf1/laps?session_key=11407                   → OpenF1 (voltas, setores, telemetria...)
 *   /api/status                                          → situação do banco e da sincronização
 *
 * Responde a partir do banco D1 (server/cache.ts) e guarda uma cópia curta na borda da Cloudflare,
 * perto do visitante, para as próximas visitas nem precisarem consultar o banco.
 */
import { BadRequestError, type CacheEnv, DAY, getOrFetch, parseRequest, UpstreamError } from "../../server/cache";

const json = (data: unknown, status = 200, cacheControl = "no-store") =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": cacheControl },
  });

async function status(env: CacheEnv) {
  const [totals, runs] = await env.DB.batch([
    env.DB.prepare("SELECT COUNT(*) AS entries, SUM(immutable) AS immutable, MAX(fetched_at) AS last_fetch FROM cache"),
    env.DB.prepare("SELECT started_at, finished_at, fetched, failed, note FROM sync_runs ORDER BY id DESC LIMIT 5"),
  ]);
  return json({ cache: totals.results[0], lastSyncRuns: runs.results });
}

export const onRequestGet: PagesFunction<CacheEnv> = async ({ request, env, params, waitUntil }) => {
  const segments = (params.path as string[] | undefined) ?? [];
  if (segments[0] === "status") return status(env);

  const url = new URL(request.url);
  const [source = "", ...rest] = segments;
  let req;
  try {
    req = parseRequest(source, rest.join("/"), url.search);
  } catch (error) {
    if (error instanceof BadRequestError) return json({ error: error.message }, 400);
    throw error;
  }

  const edgeCache = caches.default;
  const edgeKey = new Request(`${url.origin}/api/${req.source}/${req.path}${req.query ? `?${req.query}` : ""}`);
  const fromEdge = await edgeCache.match(edgeKey);
  if (fromEdge) {
    const response = new Response(fromEdge.body, fromEdge);
    response.headers.set("x-f1dash-cache", "edge");
    return response;
  }

  try {
    const result = await getOrFetch(env, req, { defer: (promise) => waitUntil(promise) });
    // Dado definitivo fica 1 dia no navegador; dado "vivo" no máximo 5 minutos
    const secondsLeft = Math.floor((result.expiresAt - Date.now()) / 1000);
    const maxAge = result.state === "stale" ? 30 : result.immutable ? DAY / 1000 : Math.max(30, Math.min(300, secondsLeft));
    const response = new Response(result.body, {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": `public, max-age=${maxAge}`,
        "x-f1dash-cache": result.state,
      },
    });
    if (result.state !== "stale") waitUntil(edgeCache.put(edgeKey, response.clone()));
    return response;
  } catch (error) {
    if (error instanceof UpstreamError) return json({ error: "Fonte de dados indisponível", status: error.status }, 502, "public, max-age=15");
    throw error;
  }
};
