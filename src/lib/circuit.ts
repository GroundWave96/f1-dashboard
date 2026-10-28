import { apiGet } from "./api";

/**
 * Traçado do circuito (atributo "d" do SVG em /public/circuits). O arquivo deve ter exatamente o
 * circuitId da API (ex.: "albert_park.svg"); `npm run check:assets` lista os que ainda faltam.
 */
export async function loadTrackPath(circuitId: string): Promise<string | null> {
  const res = await fetch(`/circuits/${circuitId}.svg`);
  if (!res.ok) return null;
  const text = await res.text();
  return text.match(/d="([^"]+)"/)?.[1] ?? null;
}

/**
 * Histórico de um circuito: GPs disputados, primeiro ano, voltas e melhor volta da última edição
 * e os últimos vencedores. Tudo vem da API, então se atualiza sozinho a cada temporada.
 */
export async function loadCircuitHistory(circuitId: string) {
  const data = await apiGet(`circuits/${circuitId}/results/1.json?limit=100`);
  const races = data.RaceTable?.Races ?? [];
  const last = races[races.length - 1];

  let fastest: { time: string; driver: string } | null = null;
  if (last) {
    const lap = await apiGet(`${last.season}/${last.round}/fastest/1/results.json`).catch(() => null);
    const result = lap?.RaceTable?.Races[0]?.Results?.[0];
    if (result?.FastestLap?.Time?.time) {
      fastest = { time: result.FastestLap.Time.time, driver: result.Driver.familyName };
    }
  }

  return {
    total: Number(data.total),
    firstSeason: races[0]?.season,
    lastSeason: last?.season,
    lastLaps: last?.Results?.[0]?.laps,
    fastest,
    winners: races.slice(-3).reverse(),
  };
}
