"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { decimal, fill } from "../../../i18n/format";
import { useAsyncData, useElementSize } from "../../../lib/hooks";
import { type DriverSummary, loadLapTelemetry } from "../../../lib/openf1";
import { atFraction, buildTrace, colorDistance, type LapTrace, type MapPoint, MINI_SECTORS, miniSectors, trackPath } from "../../../lib/telemetry";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import BlockCard from "./BlockCard";

const SAMPLES = 320;
const SURFACE = "#141417";

/** true quando o elemento chega perto da tela (a telemetria só é baixada para quem rolar até aqui). */
function useNearViewport<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || near) return;
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: "300px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [near]);
  return [ref, near] as const;
}

const luminance = (hex: string) => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** Cor do piloto 2: a da equipe, a não ser que fique parecida demais com a do piloto 1 (ex.: companheiros). */
function contrastColor(a: string, b: string) {
  if (colorDistance(a, b) >= 90) return b;
  return luminance(a) > 0.7 ? "#38bdf8" : "#f4f4f5";
}

async function loadCompare(sessionKey: number, a: DriverSummary, b: DriverSummary) {
  const [ta, tb] = await Promise.all([
    loadLapTelemetry(sessionKey, a.driver.driver_number, a.bestLapStart!, a.bestLap!, true),
    loadLapTelemetry(sessionKey, b.driver.driver_number, b.bestLapStart!, b.bestLap!, false),
  ]);
  const traceA = buildTrace(ta.car, ta.start, a.bestLap!);
  const traceB = buildTrace(tb.car, tb.start, b.bestLap!);
  if (!traceA || !traceB) return null;
  return { traceA, traceB, path: trackPath(ta.location, ta.start, traceA) };
}

/**
 * Comparação da melhor volta de dois pilotos: resumo e setores (dados oficiais da volta), mapa da
 * pista com o mais rápido em cada trecho e o gráfico de velocidade. Acelerador e freio em "mais detalhes".
 */
export default function LapCompare({ rows, sessionKey }: { rows: DriverSummary[]; sessionKey: number }) {
  const { dict, lang } = useLanguage();
  const t = dict.session.compare;
  const candidates = rows.filter((r) => r.bestLap && r.bestLapStart);
  const [picked, setPicked] = useState<[number, number] | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [details, setDetails] = useState(false);
  const [ref, near] = useNearViewport<HTMLDivElement>();

  const a = candidates.find((r) => r.driver.driver_number === picked?.[0]) ?? candidates[0];
  const b = candidates.find((r) => r.driver.driver_number === picked?.[1] && r !== a) ?? candidates.find((r) => r !== a);

  const telemetry = useAsyncData(near && a && b ? `of1:compare:${sessionKey}:${a.driver.driver_number}:${b.driver.driver_number}` : null, () => loadCompare(sessionKey, a!, b!));

  const colorA = a?.color ?? "#ef4444";
  const colorB = a && b ? contrastColor(colorA, b.color) : "#f4f4f5";

  const sectorsMini = useMemo(() => (telemetry.data ? miniSectors(telemetry.data.traceA, telemetry.data.traceB) : []), [telemetry.data]);

  if (!a || !b) {
    return (
      <BlockCard title={t.title} info={t.info}>
        <p className="text-sm text-muted">{t.noLaps}</p>
      </BlockCard>
    );
  }

  const gap = Math.abs(a.bestLap! - b.bestLap!);
  const faster = a.bestLap! <= b.bestLap! ? a : b;
  const slower = faster === a ? b : a;
  const sectorDeltas = [0, 1, 2].map((i) => (a.bestLapSectors[i] != null && b.bestLapSectors[i] != null ? a.bestLapSectors[i]! - b.bestLapSectors[i]! : null));
  const biggest = sectorDeltas.reduce<number | null>((best, delta, i) => (delta !== null && (best === null || Math.abs(delta) > Math.abs(sectorDeltas[best]!)) ? i : best), null);
  const summary = (
    <>
      {gap < 0.0005 ? fill(t.same, { a: a.driver.last_name, b: b.driver.last_name }) : fill(t.faster, { a: faster.driver.last_name, gap: decimal(gap, lang, 3), b: slower.driver.last_name })}
      {biggest !== null && gap >= 0.0005 && <span className="font-normal text-zinc-300"> {fill(t.biggest, { n: biggest + 1 })}</span>}
    </>
  );

  const options = candidates.map((r) => ({ value: String(r.driver.driver_number), label: `${r.driver.name_acronym} · ${r.driver.last_name}` }));
  const choose = (slot: 0 | 1, value: string) => {
    const number = Number(value);
    const current: [number, number] = [a.driver.driver_number, b.driver.driver_number];
    // Escolher no outro seletor o piloto que já está aqui troca os dois de lugar
    if (current[1 - slot] === number) current[1 - slot] = current[slot];
    current[slot] = number;
    setPicked(current);
    setHover(null);
  };

  return (
    <BlockCard title={t.title} summary={summary} info={t.info}>
      <div ref={ref} className="flex flex-col gap-4">
        {/* Seletores e setores */}
        <div className="grid gap-3 @2xl:grid-cols-[auto_minmax(0,1fr)] @2xl:items-end">
          <div className="grid grid-cols-2 gap-2 @md:flex @md:gap-3">
            {([0, 1] as const).map((slot) => {
              const row = slot === 0 ? a : b;
              return (
                <div key={slot} className="flex min-w-0 flex-col gap-1">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: slot === 0 ? colorA : colorB }} />
                    {slot === 0 ? t.driverA : t.driverB}
                  </span>
                  <Select ariaLabel={slot === 0 ? t.driverA : t.driverB} value={String(row.driver.driver_number)} options={options} onChange={(value) => choose(slot, value)} align={slot === 0 ? "left" : "right"} />
                </div>
              );
            })}
          </div>
          <ul className="grid grid-cols-3 gap-2">
            {sectorDeltas.map((delta, i) => {
              const winner = delta === null ? null : delta <= 0 ? a : b;
              return (
                <li key={i} className="flex min-w-0 flex-col rounded-xl border border-white/10 bg-white/[0.03] px-2.5 py-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {dict.session.sector} {i + 1}
                  </span>
                  {winner ? (
                    <span className="flex items-baseline gap-1.5">
                      <span className="text-xs font-black" style={{ color: winner === a ? colorA : colorB }}>
                        {winner.driver.name_acronym}
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-zinc-300">−{decimal(Math.abs(delta!), lang, 3)}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-muted">—</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <p className="-mt-2 text-[11px] text-muted">{t.bestLapOf}</p>

        {!near || telemetry.loading ? (
          <div className="flex h-72 items-center justify-center">
            <Spinner />
          </div>
        ) : !telemetry.data ? (
          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center text-sm text-zinc-300">{t.unavailable}</p>
        ) : (
          <div key={`${a.driver.driver_number}-${b.driver.driver_number}`} className="swap-in flex flex-col gap-4">
            <div className="grid gap-4 @3xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] @3xl:items-center">
              <TrackMap path={telemetry.data.path} sectors={sectorsMini} colorA={colorA} colorB={colorB} hover={hover} a={a} b={b} fasterHere={t.fasterHere} />
              <TraceChart
                traceA={telemetry.data.traceA}
                traceB={telemetry.data.traceB}
                colorA={colorA}
                colorB={colorB}
                metric="speed"
                label={t.speed}
                hover={hover}
                onHover={setHover}
                a={a}
                b={b}
                height={250}
              />
            </div>

            <button
              type="button"
              onClick={() => setDetails((value) => !value)}
              aria-expanded={details}
              className="tap self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-[background-color,scale] duration-150 hover:bg-white/10 active:scale-[0.96]"
            >
              {details ? t.less : t.more}
            </button>
            {details && (
              <div className="swap-in flex flex-col gap-3">
                <TraceChart
                  traceA={telemetry.data.traceA}
                  traceB={telemetry.data.traceB}
                  colorA={colorA}
                  colorB={colorB}
                  metric="throttle"
                  label={t.throttle}
                  hover={hover}
                  onHover={setHover}
                  a={a}
                  b={b}
                  height={150}
                />
                <BrakeStrips traceA={telemetry.data.traceA} traceB={telemetry.data.traceB} colorA={colorA} colorB={colorB} a={a} b={b} hover={hover} label={t.brake} />
              </div>
            )}
          </div>
        )}
      </div>
    </BlockCard>
  );
}

/** Mapa da pista: cada trecho com a cor de quem foi mais rápido nele; o ponto acompanha o gráfico. */
function TrackMap({ path, sectors, colorA, colorB, hover, a, b, fasterHere }: { path: MapPoint[]; sectors: ReturnType<typeof miniSectors>; colorA: string; colorB: string; hover: number | null; a: DriverSummary; b: DriverSummary; fasterHere: string }) {
  if (path.length < 10) return null;
  const xs = path.map((p) => p.x);
  const ys = path.map((p) => -p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = Math.max(maxX - minX, maxY - minY) * 0.06;
  const viewBox = `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`;
  const stroke = Math.max(maxX - minX, maxY - minY) / 55;

  // Trechos consecutivos do mesmo mini-setor viram um caminho só
  const pieces: { d: string; color: string }[] = [];
  let current: { index: number; d: string } | null = null;
  path.forEach((point, i) => {
    const index = Math.min(MINI_SECTORS - 1, Math.floor(point.f * MINI_SECTORS));
    const xy = `${point.x},${-point.y}`;
    if (!current || current.index !== index) {
      if (current) pieces.push({ d: `${current.d} L${xy}`, color: sectors[current.index]?.faster === "b" ? colorB : colorA });
      current = { index, d: `M${i > 0 ? `${path[i - 1].x},${-path[i - 1].y} L` : ""}${xy}` };
    } else current.d += ` L${xy}`;
  });
  if (current) {
    const last = current as { index: number; d: string };
    pieces.push({ d: last.d, color: sectors[last.index]?.faster === "b" ? colorB : colorA });
  }

  const marker = hover !== null ? path.reduce((best, p) => (Math.abs(p.f - hover) < Math.abs(best.f - hover) ? p : best), path[0]) : null;

  return (
    <figure className="flex flex-col gap-2">
      <svg viewBox={viewBox} className="mx-auto block h-auto max-h-72 w-full" role="img" aria-label={`${a.driver.name_acronym} / ${b.driver.name_acronym}`}>
        <path d={`M${path.map((p) => `${p.x},${-p.y}`).join(" L")}`} fill="none" stroke="#27272a" strokeWidth={stroke * 2.2} strokeLinejoin="round" strokeLinecap="round" />
        {pieces.map((piece, i) => (
          <path key={i} d={piece.d} fill="none" stroke={piece.color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {/* Linha de chegada */}
        <circle cx={path[0].x} cy={-path[0].y} r={stroke * 0.9} fill="#fff" stroke={SURFACE} strokeWidth={stroke * 0.4} />
        {marker && <circle cx={marker.x} cy={-marker.y} r={stroke * 1.3} fill="#fff" stroke={SURFACE} strokeWidth={stroke * 0.5} />}
      </svg>
      <figcaption className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-zinc-300">
        {[
          [a, colorA],
          [b, colorB],
        ].map(([row, color]) => (
          <span key={(row as DriverSummary).driver.driver_number} className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full" style={{ backgroundColor: color as string }} />
            <span className="font-black text-white">{(row as DriverSummary).driver.name_acronym}</span> {fasterHere}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

const MARGIN = { top: 12, right: 10, bottom: 22, left: 34 };

/** Gráfico de uma grandeza (velocidade ou acelerador) ao longo da volta, para os dois pilotos. */
function TraceChart({ traceA, traceB, colorA, colorB, metric, label, hover, onHover, a, b, height }: {
  traceA: LapTrace;
  traceB: LapTrace;
  colorA: string;
  colorB: string;
  metric: "speed" | "throttle";
  label: string;
  hover: number | null;
  onHover: (f: number | null) => void;
  a: DriverSummary;
  b: DriverSummary;
  height: number;
}) {
  const { dict, lang } = useLanguage();
  const t = dict.session.compare;
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const width = size.width;

  const series = useMemo(() => {
    const sample = (trace: LapTrace) => Array.from({ length: SAMPLES + 1 }, (_, i) => atFraction(trace, i / SAMPLES, metric));
    return { a: sample(traceA), b: sample(traceB) };
  }, [traceA, traceB, metric]);

  const maxValue = metric === "throttle" ? 100 : Math.ceil((Math.max(...series.a, ...series.b) + 5) / 50) * 50;
  const minValue = metric === "throttle" ? 0 : Math.max(0, Math.floor((Math.min(...series.a, ...series.b) - 5) / 50) * 50);
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const x = (f: number) => MARGIN.left + f * plotW;
  const y = (v: number) => MARGIN.top + plotH - ((v - minValue) / Math.max(maxValue - minValue, 1)) * plotH;
  const path = (values: number[]) => values.map((v, i) => `${i ? "L" : "M"}${x(i / SAMPLES).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const step = metric === "throttle" ? 50 : maxValue - minValue > 200 ? 100 : 50;
  const yTicks = Array.from({ length: Math.floor((maxValue - minValue) / step) + 1 }, (_, i) => minValue + i * step);
  const km = traceA.length / 1000;
  const xTicks = Array.from({ length: Math.floor(km) }, (_, i) => i + 1).filter((k) => k < km - 0.25);

  const handlePointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onHover(Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)));
  };

  // Diferença acumulada até o ponto (quem está à frente na volta)
  const delta = hover !== null ? atFraction(traceA, hover, "t") - atFraction(traceB, hover, "t") : 0;
  const valueA = hover !== null ? atFraction(traceA, hover, metric) : 0;
  const valueB = hover !== null ? atFraction(traceB, hover, metric) : 0;
  const tooltipOnLeft = hover !== null && hover > 0.55;
  const dashedB = colorDistance(colorA, colorB) < 90;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      <div ref={containerRef} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg width={width} height={height} className="block select-none">
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(tick)} y2={y(tick)} stroke="#27272a" strokeWidth="1" />
                <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted text-[10px] font-mono">
                  {tick}
                </text>
              </g>
            ))}
            {xTicks.map((k) => (
              <text key={k} x={x((k * 1000) / traceA.length)} y={height - 6} textAnchor="middle" className="fill-muted text-[10px] font-mono">
                {k} km
              </text>
            ))}
            <path d={path(series.b)} fill="none" stroke={colorB} strokeWidth={1.75} strokeDasharray={dashedB ? "5 3" : undefined} strokeLinejoin="round" />
            <path d={path(series.a)} fill="none" stroke={colorA} strokeWidth={1.75} strokeLinejoin="round" />
            {hover !== null && (
              <g pointerEvents="none">
                <line x1={x(hover)} x2={x(hover)} y1={MARGIN.top} y2={MARGIN.top + plotH} stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
                <circle cx={x(hover)} cy={y(valueA)} r={3.5} fill={colorA} stroke={SURFACE} strokeWidth={1.5} />
                <circle cx={x(hover)} cy={y(valueB)} r={3.5} fill={colorB} stroke={SURFACE} strokeWidth={1.5} />
              </g>
            )}
            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              style={{ touchAction: "pan-y" }}
              onPointerMove={handlePointer}
              onPointerDown={handlePointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && onHover(null)}
            />
          </svg>
        )}
        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute top-1 z-10 rounded-lg border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-2xl"
            style={tooltipOnLeft ? { right: width - x(hover) + 10 } : { left: x(hover) + 10 }}
          >
            {[
              [a, colorA, valueA],
              [b, colorB, valueB],
            ].map(([row, color, value]) => (
              <div key={(row as DriverSummary).driver.driver_number} className="flex items-center gap-2 whitespace-nowrap text-xs">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color as string }} />
                <span className="font-black text-white">{(row as DriverSummary).driver.name_acronym}</span>
                <span className="font-mono text-zinc-200">
                  {Math.round(value as number)}
                  {metric === "speed" ? " km/h" : "%"}
                </span>
              </div>
            ))}
            {metric === "speed" && (
              <div className="mt-1 whitespace-nowrap border-t border-white/10 pt-1 text-[11px] text-zinc-300">
                {Math.abs(delta) < 0.0005 ? t.level : fill(t.ahead, { driver: (delta < 0 ? a : b).driver.name_acronym, gap: decimal(Math.abs(delta), lang, 3) })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/** Freio: uma faixa por piloto, marcada onde ele estava freando. */
function BrakeStrips({ traceA, traceB, colorA, colorB, a, b, hover, label }: { traceA: LapTrace; traceB: LapTrace; colorA: string; colorB: string; a: DriverSummary; b: DriverSummary; hover: number | null; label: string }) {
  const segments = (trace: LapTrace) => {
    const list: { from: number; to: number }[] = [];
    let open: number | null = null;
    trace.points.forEach((p) => {
      const f = p.d / trace.length;
      if (p.brake && open === null) open = f;
      if (!p.brake && open !== null) {
        list.push({ from: open, to: f });
        open = null;
      }
    });
    if (open !== null) list.push({ from: open, to: 1 });
    return list;
  };
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted">{label}</span>
      {[
        [a, colorA, traceA],
        [b, colorB, traceB],
      ].map(([row, color, trace]) => (
                <div key={(row as DriverSummary).driver.driver_number} className="grid grid-cols-[26px_minmax(0,1fr)] items-center gap-2 pr-[10px]">
          <span className="text-right text-[11px] font-black text-white">{(row as DriverSummary).driver.name_acronym}</span>
          <span className="relative h-3 rounded-full bg-white/[0.04]">
            {segments(trace as LapTrace).map((s, i) => (
              <span key={i} className="absolute inset-y-0 rounded-full" style={{ left: `${s.from * 100}%`, width: `${Math.max((s.to - s.from) * 100, 0.4)}%`, backgroundColor: color as string }} />
            ))}
            {hover !== null && <span className="absolute -inset-y-1 w-px bg-zinc-400" style={{ left: `${hover * 100}%` }} />}
          </span>
        </div>
      ))}
    </div>
  );
}
