import { MRData, PastRace } from "../types/f1";

const BASE_URL = "https://api.jolpi.ca/ergast/f1/";
const MAX_CONCURRENT = 3;
const MAX_RETRIES = 3;
const PAGE_LIMIT = 100;

// Cache em memória: seções diferentes que pedem o mesmo endpoint compartilham a mesma requisição
const cache = new Map<string, Promise<MRData>>();
const racesCache = new Map<string, Promise<PastRace[]>>();

// Fila simples para respeitar o limite de requisições simultâneas da Jolpica
let active = 0;
const queue: (() => void)[] = [];

async function acquireSlot() {
  if (active < MAX_CONCURRENT) {
    active++;
    return;
  }
  await new Promise<void>((resolve) => queue.push(resolve));
}

function releaseSlot() {
  const next = queue.shift();
  if (next) next();
  else active--;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function request(path: string): Promise<MRData> {
  for (let attempt = 0; ; attempt++) {
    await acquireSlot();
    let res: Response;
    try {
      res = await fetch(`${BASE_URL}${path}`);
    } finally {
      releaseSlot();
    }

    if (res.ok) {
      const json = await res.json();
      return json.MRData as MRData;
    }

    // 429 = limite de requisições; 5xx = instabilidade temporária
    const retryable = res.status === 429 || res.status >= 500;
    if (!retryable || attempt >= MAX_RETRIES) {
      throw new Error(`Jolpica respondeu ${res.status} para ${path}`);
    }
    await wait(800 * 2 ** attempt);
  }
}

export function apiGet(path: string): Promise<MRData> {
  const cached = cache.get(path);
  if (cached) return cached;

  const promise = request(path);
  cache.set(path, promise);
  // Em caso de erro, remove do cache para permitir uma nova tentativa depois
  promise.catch(() => cache.delete(path));
  return promise;
}

type RaceResultsKey = "Results" | "SprintResults" | "QualifyingResults";

/**
 * Busca todas as páginas de um endpoint de resultados (results, sprint, qualifying)
 * e agrupa por etapa. A API pagina por resultado individual, então uma mesma corrida
 * pode vir dividida entre duas páginas.
 */
export function apiGetAllRaces(season: string, endpoint: "results" | "sprint" | "qualifying"): Promise<PastRace[]> {
  const key = `${season}/${endpoint}`;
  const cached = racesCache.get(key);
  if (cached) return cached;

  const resultsKey: RaceResultsKey =
    endpoint === "results" ? "Results" : endpoint === "sprint" ? "SprintResults" : "QualifyingResults";

  const promise = (async () => {
    const first = await apiGet(`${season}/${endpoint}.json?limit=${PAGE_LIMIT}&offset=0`);
    const total = parseInt(first.total);
    const pages = [first];
    for (let offset = PAGE_LIMIT; offset < total; offset += PAGE_LIMIT) {
      pages.push(await apiGet(`${season}/${endpoint}.json?limit=${PAGE_LIMIT}&offset=${offset}`));
    }

    const byRound = new Map<string, PastRace>();
    for (const page of pages) {
      for (const race of page.RaceTable?.Races ?? []) {
        const entries = race[resultsKey] ?? [];
        const existing = byRound.get(race.round);
        if (existing) {
          existing[resultsKey] = [...(existing[resultsKey] ?? []), ...entries] as never;
        } else {
          byRound.set(race.round, { ...race, [resultsKey]: [...entries] });
        }
      }
    }
    return [...byRound.values()].sort((a, b) => Number(a.round) - Number(b.round));
  })();

  racesCache.set(key, promise);
  promise.catch(() => racesCache.delete(key));
  return promise;
}
