/**
 * Contas da comparação de voltas. O OpenF1 manda leituras por horário (~3,7 por segundo), sem a
 * distância percorrida: ela é calculada somando velocidade × tempo. Como cada piloto faz uma
 * trajetória um pouco diferente, as voltas são comparadas pela fração da volta (0 = largada, 1 = chegada).
 */
import type { OF1CarData, OF1Location } from "./openf1";

export interface TracePoint {
  // Segundos desde o início da volta
  t: number;
  // Metros desde o início da volta
  d: number;
  speed: number;
  throttle: number;
  brake: boolean;
  gear: number;
}

export interface LapTrace {
  points: TracePoint[];
  length: number;
  duration: number;
}

export function buildTrace(samples: OF1CarData[], startMs: number, duration: number): LapTrace | null {
  const points = samples
    .map((s) => ({ t: (Date.parse(s.date) - startMs) / 1000, d: 0, speed: s.speed, throttle: Math.min(100, Math.max(0, s.throttle)), brake: s.brake > 0, gear: s.n_gear }))
    .filter((p) => p.t >= 0 && p.t <= duration)
    .sort((a, b) => a.t - b.t);
  if (points.length < 20) return null;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    b.d = a.d + ((a.speed + b.speed) / 2 / 3.6) * (b.t - a.t);
  }
  // Pedaço entre a última leitura e o fim da volta, na última velocidade conhecida
  const last = points[points.length - 1];
  const length = last.d + (last.speed / 3.6) * Math.max(0, duration - last.t);
  return { points, length, duration };
}

/** Índice do último ponto com chave <= valor (busca binária). */
function lowerIndex(points: TracePoint[], key: "t" | "d", value: number) {
  let lo = 0;
  let hi = points.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (points[mid][key] <= value) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Valor interpolado na fração `f` da volta. */
export function atFraction(trace: LapTrace, f: number, key: "t" | "speed" | "throttle") {
  const target = Math.min(1, Math.max(0, f)) * trace.length;
  const { points } = trace;
  const i = lowerIndex(points, "d", target);
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  if (key === "t" && target >= points[points.length - 1].d) {
    // Depois da última leitura: o tempo vai até o fim oficial da volta
    const lastD = points[points.length - 1].d;
    const span = trace.length - lastD;
    return span > 0 ? points[points.length - 1].t + ((target - lastD) / span) * (trace.duration - points[points.length - 1].t) : trace.duration;
  }
  if (b === a || b.d === a.d) return a[key];
  return a[key] + ((target - a.d) / (b.d - a.d)) * (b[key] - a[key]);
}

/** Fração da volta em que o piloto estava no instante `t` (segundos desde o início da volta). */
export function fractionAtTime(trace: LapTrace, t: number) {
  const { points } = trace;
  const i = lowerIndex(points, "t", t);
  const a = points[i];
  const b = points[Math.min(i + 1, points.length - 1)];
  const d = b === a || b.t === a.t ? a.d : a.d + ((t - a.t) / (b.t - a.t)) * (b.d - a.d);
  return Math.min(1, Math.max(0, d / trace.length));
}

export const MINI_SECTORS = 24;

/** Em cada trecho da volta, quem foi mais rápido ("a" ou "b") e por quanto (segundos). */
export function miniSectors(a: LapTrace, b: LapTrace, count = MINI_SECTORS) {
  return Array.from({ length: count }, (_, i) => {
    const from = i / count;
    const to = (i + 1) / count;
    const timeA = atFraction(a, to, "t") - atFraction(a, from, "t");
    const timeB = atFraction(b, to, "t") - atFraction(b, from, "t");
    return { faster: timeA <= timeB ? ("a" as const) : ("b" as const), gain: Math.abs(timeA - timeB) };
  });
}

export interface MapPoint {
  x: number;
  y: number;
  f: number;
}

/** Traçado da pista com a fração da volta de cada ponto (para pintar os trechos e mostrar o carro). */
export function trackPath(locations: OF1Location[], startMs: number, trace: LapTrace): MapPoint[] {
  return locations
    .map((loc) => ({ t: (Date.parse(loc.date) - startMs) / 1000, x: loc.x, y: loc.y }))
    .filter((p) => p.t >= 0 && p.t <= trace.duration && (p.x !== 0 || p.y !== 0))
    .sort((p, q) => p.t - q.t)
    .map((p) => ({ x: p.x, y: p.y, f: fractionAtTime(trace, p.t) }));
}

/** Diferença de cor entre duas cores hex (0–441): abaixo de ~80 os pilotos ficariam confundíveis. */
export function colorDistance(a: string, b: string) {
  const rgb = (hex: string) => {
    const h = hex.replace("#", "");
    return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) || 0);
  };
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2);
}
