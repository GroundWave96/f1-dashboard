"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { fill } from "../../../i18n/format";
import { useElementSize } from "../../../lib/hooks";
import { type DriverSummary, gridChange, type OF1Lap, type OF1Pit, type OF1Position, type OF1RaceControl, type SessionKind } from "../../../lib/openf1";
import { neutralizedLaps, parseRaceControl } from "../../../lib/raceControl";
import BlockCard from "./BlockCard";
import { usePlace } from "./GridInfo";

const SURFACE = "#141417";
const MARGIN = { top: 20, right: 40, bottom: 24, left: 26 };
const LABEL_GAP = 12;

interface Props {
  rows: DriverSummary[];
  laps: OF1Lap[];
  positions: OF1Position[];
  pits: OF1Pit[];
  raceControl: OF1RaceControl[];
  kind: SessionKind | null;
}

/**
 * Posições volta a volta (corrida e Sprint): uma linha por piloto, 1º no topo. Por padrão só o
 * vencedor, quem mais subiu e quem mais caiu ficam coloridos; os outros, em cinza clarinho, para o
 * gráfico não virar um emaranhado. Tocar nas siglas destaca outros pilotos.
 */
export default function PositionChart({ rows, laps, positions, pits, raceControl, kind, className }: Props & { className?: string }) {
  const { dict } = useLanguage();
  const t = dict.session.positions;
  const place = usePlace();
  const [containerRef, size] = useElementSize<HTMLDivElement>();
  const [hoverLap, setHoverLap] = useState<number | null>(null);
  // A animação de desenho (pathLength + tracejado) roda uma vez e é desligada: depois disso, redimensionar
  // a janela ou girar o celular não pode deixar a linha "pela metade"
  const [drawn, setDrawn] = useState(false);

  const { series, totalLaps } = useMemo(() => buildSeries(rows, laps, positions), [rows, laps, positions]);
  const periods = useMemo(() => neutralizedLaps(parseRaceControl(raceControl).events, totalLaps), [raceControl, totalLaps]);

  // Destaques iniciais: vencedor, quem mais ganhou e quem mais perdeu posições
  const defaults = useMemo(() => {
    const finishers = rows.filter((r) => !r.status && series.has(r.driver.driver_number));
    const byChange = finishers.map((r) => ({ r, change: gridChange(r, kind) ?? 0 })).sort((a, b) => b.change - a.change);
    const picks = [finishers[0], byChange[0]?.change > 0 ? byChange[0].r : undefined, byChange.at(-1)?.change !== undefined && byChange.at(-1)!.change < 0 ? byChange.at(-1)!.r : undefined, finishers[1]];
    return [...new Set(picks.filter(Boolean).map((r) => r!.driver.driver_number))].slice(0, 3);
  }, [rows, series, kind]);
  const [chosen, setChosen] = useState<number[] | null>(null);
  const highlighted = chosen ?? defaults;

  if (series.size < 2 || totalLaps < 2) return null;

  const ordered = rows.filter((r) => series.has(r.driver.driver_number));
  const count = Math.max(ordered.length, ...[...series.values()].flat().filter((v): v is number => v !== null));
  const byNumber = new Map(ordered.map((r) => [r.driver.driver_number, r]));

  // Resumo: quem mais subiu (ou de onde o vencedor largou)
  const best = ordered
    .filter((r) => !r.status && r.grid !== null)
    .map((r) => ({ r, change: gridChange(r, kind) ?? 0 }))
    .sort((a, b) => b.change - a.change)[0];
  const winner = ordered[0];
  const summary =
    best && best.change >= 3
      ? fill(t.gained, { driver: best.r.driver.last_name, n: best.change, from: place(best.r.grid!), to: place(best.r.position) })
      : winner?.grid
        ? fill(t.winnerFrom, { driver: winner.driver.last_name, from: place(winner.grid) })
        : "";

  const toggle = (number: number) => {
    const current = chosen ?? defaults;
    setChosen(current.includes(number) ? current.filter((n) => n !== number) : [...current, number]);
  };

  // Companheiros de equipe têm a mesma cor: o segundo destacado da equipe vira tracejado
  const dashed = new Set<number>();
  const seenColors = new Set<string>();
  for (const number of highlighted) {
    const color = byNumber.get(number)?.color ?? "";
    if (seenColors.has(color)) dashed.add(number);
    seenColors.add(color);
  }

  const width = size.width;
  const height = Math.round(Math.min(460, Math.max(280, width * 0.55)));
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotH = height - MARGIN.top - MARGIN.bottom;
  const x = (lap: number) => MARGIN.left + (lap / totalLaps) * plotW;
  const y = (pos: number) => MARGIN.top + ((pos - 1) / Math.max(count - 1, 1)) * plotH;

  const pathFor = (values: (number | null)[]) => {
    let d = "";
    let pen = false;
    values.forEach((value, lap) => {
      if (value === null) {
        pen = false;
        return;
      }
      d += `${pen ? "L" : "M"}${x(lap).toFixed(1)},${y(value).toFixed(1)}`;
      pen = true;
    });
    return d;
  };

  const lastValue = (values: (number | null)[]) => {
    for (let i = values.length - 1; i >= 0; i--) if (values[i] !== null) return { lap: i, pos: values[i]! };
    return null;
  };

  const labels = highlighted
    .map((number) => {
      const end = lastValue(series.get(number) ?? []);
      return end && { number, x: x(end.lap), y: y(end.pos), text: byNumber.get(number)?.driver.name_acronym ?? "" };
    })
    .filter((l): l is { number: number; x: number; y: number; text: string } => Boolean(l))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < labels.length; i++) labels[i].y = Math.max(labels[i].y, labels[i - 1].y + LABEL_GAP);

  const yTicks = [1, 5, 10, 15, 20].filter((p) => p <= count);
  const xStep = totalLaps > 40 ? 10 : 5;
  const xTicks = [1, ...Array.from({ length: Math.floor(totalLaps / xStep) }, (_, i) => (i + 1) * xStep).filter((l) => l < totalLaps - xStep / 3), totalLaps];
  const pitsBy = new Map<number, number[]>();
  for (const pit of pits) pitsBy.set(pit.driver_number, [...(pitsBy.get(pit.driver_number) ?? []), pit.lap_number]);

  const handlePointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoverLap(Math.min(totalLaps, Math.max(0, Math.round(((e.clientX - rect.left) / rect.width) * totalLaps))));
  };
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHoverLap((current) => Math.min(totalLaps, Math.max(0, (current ?? totalLaps) + (e.key === "ArrowRight" ? 1 : -1))));
  };

  const tooltipRows =
    hoverLap === null
      ? []
      : highlighted
          .map((number) => ({ number, pos: series.get(number)?.[hoverLap] ?? null, row: byNumber.get(number)!, pitted: pitsBy.get(number)?.includes(hoverLap) ?? false }))
          .filter((r) => r.pos !== null && r.row)
          .sort((a, b) => a.pos! - b.pos!);
  const tooltipOnLeft = hoverLap !== null && x(hoverLap) > width * 0.55;

  return (
    <BlockCard className={className} title={t.title} summary={summary} info={t.info}>
      {/* Siglas para destacar pilotos (na ordem de chegada) */}
      <div role="group" aria-label={t.highlight} className="flex flex-wrap gap-1.5">
        {ordered.map((row) => {
          const on = highlighted.includes(row.driver.driver_number);
          return (
            <button
              key={row.driver.driver_number}
              type="button"
              onClick={() => toggle(row.driver.driver_number)}
              aria-pressed={on}
              className={`tap inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black tracking-wide transition-colors duration-150 ${on ? "border-white/25 bg-white/10 text-white" : "border-white/10 text-muted hover:text-white"}`}
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: on ? row.color : "#52525b" }} />
              {row.driver.name_acronym}
            </button>
          );
        })}
      </div>

      <div
        ref={containerRef}
        className="relative w-full rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-red-500"
        style={{ height }}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={() => setHoverLap(null)}
        role="img"
        aria-label={`${t.title}. ${summary}`}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block select-none">
            {/* Faixas de safety car */}
            {periods.map((period, i) => (
              <g key={i}>
                <rect x={x(Math.max(period.from - 1, 0))} y={MARGIN.top} width={Math.max(x(period.to) - x(Math.max(period.from - 1, 0)), 2)} height={plotH} fill="#facc15" fillOpacity={period.kind === "sc" ? 0.12 : 0.07} />
                <text x={x(Math.max(period.from - 1, 0)) + 2} y={MARGIN.top - 6} className="fill-yellow-400 text-[9px] font-black">
                  {period.kind === "sc" ? "SC" : "VSC"}
                </text>
              </g>
            ))}

            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(tick)} y2={y(tick)} stroke="#27272a" strokeWidth="1" />
                <text x={MARGIN.left - 6} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-muted text-[10px] font-mono">
                  {tick}
                </text>
              </g>
            ))}
            {xTicks.map((lap) => (
              <text key={lap} x={x(lap)} y={height - 6} textAnchor="middle" className="fill-muted text-[10px] font-mono">
                {lap}
              </text>
            ))}

            {/* Pilotos sem destaque, ao fundo */}
            {ordered
              .filter((r) => !highlighted.includes(r.driver.driver_number))
              .map((r) => (
                <path key={r.driver.driver_number} d={pathFor(series.get(r.driver.driver_number)!)} fill="none" stroke="#52525b" strokeOpacity={0.45} strokeWidth={1.25} strokeLinejoin="round" />
              ))}

            {/* Destaques, com as paradas no box */}
            {highlighted.map((number) => {
              const values = series.get(number);
              const row = byNumber.get(number);
              if (!values || !row) return null;
              return (
                <g key={number}>
                  <path
                    d={pathFor(values)}
                    {...(drawn || dashed.has(number) ? {} : { pathLength: 1, className: "draw-line", onAnimationEnd: () => setDrawn(true) })}
                    fill="none"
                    stroke={row.color}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    strokeDasharray={dashed.has(number) ? "6 4" : undefined}
                  />
                  {(pitsBy.get(number) ?? []).map((lap) =>
                    values[lap] != null ? <circle key={lap} cx={x(lap)} cy={y(values[lap]!)} r={3.5} fill={SURFACE} stroke={row.color} strokeWidth={2} /> : null,
                  )}
                </g>
              );
            })}

            {labels.map((label) => (
              <text key={label.number} x={Math.min(label.x + 6, width - MARGIN.right + 6)} y={label.y} dy="0.32em" className="fill-zinc-200 text-[10px] font-black">
                {label.text}
              </text>
            ))}

            {hoverLap !== null && (
              <g pointerEvents="none">
                <line x1={x(hoverLap)} x2={x(hoverLap)} y1={MARGIN.top} y2={MARGIN.top + plotH} stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
                {tooltipRows.map((r) => (
                  <circle key={r.number} cx={x(hoverLap)} cy={y(r.pos!)} r={4} fill={r.row.color} stroke={SURFACE} strokeWidth={2} />
                ))}
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
              onPointerLeave={(e) => e.pointerType === "mouse" && setHoverLap(null)}
            />
          </svg>
        )}

        {hoverLap !== null && tooltipRows.length > 0 && (
          <div
            className="pointer-events-none absolute top-1 z-10 min-w-36 rounded-lg border border-zinc-700 bg-zinc-950/95 px-3 py-2 shadow-2xl"
            style={tooltipOnLeft ? { right: width - x(hoverLap) + 10 } : { left: x(hoverLap) + 10 }}
          >
            <div className="mb-1.5 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider text-muted">{hoverLap === 0 ? t.start : fill(t.lap, { n: hoverLap })}</div>
            <ul className="flex flex-col gap-1">
              {tooltipRows.map((r) => (
                <li key={r.number} className="flex items-center gap-2 whitespace-nowrap text-xs">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: r.row.color }} />
                  <span className="w-7 font-mono font-bold text-white">{place(r.pos!)}</span>
                  <span className="font-bold text-zinc-200">{r.row.driver.name_acronym}</span>
                  {r.pitted && <span className="text-[10px] text-muted">· {t.pit}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="hidden text-[11px] text-muted [@media(orientation:portrait)_and_(max-width:500px)]:block">{t.rotate}</p>
    </BlockCard>
  );
}

/**
 * Posição de cada piloto ao fim de cada volta. O OpenF1 manda só as mudanças de posição, com horário;
 * a posição na volta N é a que valia quando o piloto cruzou a linha (início da volta N + 1).
 */
function buildSeries(rows: DriverSummary[], laps: OF1Lap[], positions: OF1Position[]) {
  const changes = new Map<number, { t: number; p: number }[]>();
  for (const record of positions) {
    const list = changes.get(record.driver_number) ?? [];
    list.push({ t: Date.parse(record.date), p: record.position });
    changes.set(record.driver_number, list);
  }
  for (const list of changes.values()) list.sort((a, b) => a.t - b.t);

  const lapsBy = new Map<number, Map<number, OF1Lap>>();
  for (const lap of laps) {
    const map = lapsBy.get(lap.driver_number) ?? new Map<number, OF1Lap>();
    map.set(lap.lap_number, lap);
    lapsBy.set(lap.driver_number, map);
  }

  const totalLaps = Math.max(0, ...rows.filter((r) => !r.status).map((r) => r.laps));
  const series = new Map<number, (number | null)[]>();

  for (const row of rows) {
    const number = row.driver.driver_number;
    const list = changes.get(number);
    const own = lapsBy.get(number);
    if (!list?.length || !own?.size) continue;

    const positionAt = (time: number) => {
      let value: number | null = null;
      for (const change of list) {
        if (change.t > time) break;
        value = change.p;
      }
      return value;
    };

    const lastLap = Math.min(totalLaps, Math.max(...own.keys()));
    const values: (number | null)[] = Array(totalLaps + 1).fill(null);
    values[0] = row.grid ?? list[0].p;
    for (let lap = 1; lap <= lastLap; lap++) {
      const next = own.get(lap + 1)?.date_start;
      const current = own.get(lap);
      const end = next ? Date.parse(next) : current?.date_start && current.lap_duration ? Date.parse(current.date_start) + current.lap_duration * 1000 : null;
      // A posição muda um instante depois de cruzar a linha
      values[lap] = end !== null ? (positionAt(end + 1000) ?? values[lap - 1]) : values[lap - 1];
    }
    // Na última volta vale a classificação oficial (já com as punições)
    if (!row.status && row.position < 99) values[lastLap] = row.position;
    series.set(number, values);
  }
  return { series, totalLaps };
}
