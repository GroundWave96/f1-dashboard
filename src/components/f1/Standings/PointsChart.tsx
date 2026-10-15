"use client";

import React, { useMemo, useState } from "react";
import { apiGetAllRaces } from "../../../lib/api";
import { buildPointsTimeline } from "../../../lib/championship";
import { useAsyncData, useElementWidth } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";

// Paleta categórica validada (daltonismo e contraste) sobre o fundo zinc-900 do card
const SERIES_COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300"];
const SURFACE = "#18181b";
const MARGIN = { top: 16, right: 48, bottom: 28, left: 36 };
const LABEL_GAP = 13;

const niceStep = (raw: number) => {
  const power = 10 ** Math.floor(Math.log10(raw));
  const fraction = raw / power;
  return (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * power;
};

async function loadSeasonResults() {
  const [races, sprints] = await Promise.all([apiGetAllRaces("current", "results"), apiGetAllRaces("current", "sprint")]);
  return { races, sprints };
}

export default function PointsChart() {
  const { dict } = useLanguage();
  const [kind, setKind] = useState<"drivers" | "constructors">("drivers");
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [containerRef, width] = useElementWidth<HTMLDivElement>();
  const { data, loading } = useAsyncData("season-results:current", loadSeasonResults);

  const timeline = useMemo(() => (data ? buildPointsTimeline(data.races, data.sprints, kind) : null), [data, kind]);

  // Top 6 pela pontuação final; a cor acompanha o participante, não muda ao ocultar outros
  const series = useMemo(() => {
    if (!timeline) return [];
    return [...timeline.series.entries()]
      .sort((a, b) => b[1][b[1].length - 1] - a[1][a[1].length - 1])
      .slice(0, SERIES_COLORS.length)
      .map(([id, values], i) => ({ id, values, color: SERIES_COLORS[i], ...timeline.labels.get(id)! }));
  }, [timeline]);

  const switchKind = (next: "drivers" | "constructors") => {
    setKind(next);
    setHidden(new Set());
    setHoverIndex(null);
  };

  const toggleSeries = (id: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (series.length - next.size > 1) next.add(id);
      return next;
    });
  };

  const header = (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white uppercase tracking-wider">{dict.standings.pointsProgress}</span>
        <span className="text-[10px] text-zinc-500">{dict.standings.chartHint}</span>
      </div>
      <div className="relative bg-zinc-950 p-0.5 rounded-full border border-zinc-800 flex items-center h-8 w-40 shrink-0 self-center sm:self-auto">
        <div className={`absolute h-7 w-[calc(50%-2px)] bg-zinc-700 rounded-full transition-transform duration-300 ease-in-out ${kind === "drivers" ? "translate-x-0" : "translate-x-full"}`} />
        {(["drivers", "constructors"] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => switchKind(option)}
            aria-pressed={kind === option}
            className={`relative z-10 h-full flex-1 text-[10px] font-bold uppercase tracking-tight transition-colors ${kind === option ? "text-white" : "text-zinc-500"}`}
          >
            {option === "drivers" ? dict.standings.drivers : dict.standings.teams}
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 sm:p-6 h-full flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!timeline || timeline.rounds.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 sm:p-6 flex flex-col gap-4">
        {header}
        <p className="text-sm text-zinc-500 text-center py-10">{dict.standings.chartEmpty}</p>
      </div>
    );
  }

  const rounds = timeline.rounds;
  const visible = series.filter((s) => !hidden.has(s.id));
  const height = width < 520 ? 240 : width < 900 ? 300 : 380;
  const plotW = Math.max(width - MARGIN.left - MARGIN.right, 0);
  const plotH = height - MARGIN.top - MARGIN.bottom;

  const maxValue = Math.max(1, ...visible.map((s) => s.values[s.values.length - 1]));
  const step = niceStep(maxValue / 4);
  const yMax = Math.ceil(maxValue / step) * step;
  const yTicks = Array.from({ length: Math.round(yMax / step) + 1 }, (_, i) => i * step);

  // Índice 0 = largada da temporada (0 pts); índice i = após a rodada i
  const x = (i: number) => MARGIN.left + (rounds.length ? (i / rounds.length) * plotW : 0);
  const y = (v: number) => MARGIN.top + plotH - (v / yMax) * plotH;
  const pathFor = (values: number[]) => [0, ...values].map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join("");

  const labelEvery = Math.max(1, Math.ceil(rounds.length / Math.max(plotW / 34, 1)));

  // Rótulos diretos no fim das linhas, afastados para não se sobreporem
  const endLabels = visible
    .map((s) => ({ id: s.id, text: s.short, y: y(s.values[s.values.length - 1]) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < endLabels.length; i++) {
    endLabels[i].y = Math.max(endLabels[i].y, endLabels[i - 1].y + LABEL_GAP);
  }

  const handlePointer = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHoverIndex(Math.min(rounds.length, Math.max(1, Math.round(ratio * rounds.length))));
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHoverIndex((current) => {
      const base = current ?? rounds.length;
      return Math.min(rounds.length, Math.max(1, base + (e.key === "ArrowRight" ? 1 : -1)));
    });
  };

  const tooltipRows = hoverIndex !== null
    ? visible.map((s) => ({ ...s, value: s.values[hoverIndex - 1] })).sort((a, b) => b.value - a.value)
    : [];
  const tooltipOnLeft = hoverIndex !== null && x(hoverIndex) > width * 0.6;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl p-4 sm:p-6 flex flex-col gap-4 animate-in fade-in duration-500">
      {header}

      <div className="flex flex-wrap gap-1.5" role="group" aria-label={dict.standings.chartHint}>
        {series.map((s) => {
          const off = hidden.has(s.id);
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => toggleSeries(s.id)}
              aria-pressed={!off}
              className={`flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] transition-all ${off ? "border-zinc-800 text-zinc-600" : "border-zinc-700 bg-zinc-950/40 text-zinc-300 hover:border-zinc-500"}`}
            >
              <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: off ? "#3f3f46" : s.color }} />
              <span className={off ? "line-through" : ""}>{s.name}</span>
              <span className={`font-mono font-bold ${off ? "" : "text-white"}`}>{s.values[s.values.length - 1]}</span>
            </button>
          );
        })}
      </div>

      <div
        ref={containerRef}
        className="relative w-full outline-none focus-visible:ring-1 focus-visible:ring-zinc-600 rounded"
        style={{ height }}
        tabIndex={0}
        onKeyDown={handleKey}
        onBlur={() => setHoverIndex(null)}
        aria-label={`${dict.standings.pointsProgress}: ${visible.map((s) => `${s.name} ${s.values[s.values.length - 1]}`).join(", ")}`}
      >
        {width > 0 && (
          <svg width={width} height={height} className="block select-none">
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={MARGIN.left} x2={MARGIN.left + plotW} y1={y(tick)} y2={y(tick)} stroke="#27272a" strokeWidth="1" />
                <text x={MARGIN.left - 8} y={y(tick)} dy="0.32em" textAnchor="end" className="fill-zinc-500 text-[10px] font-mono">{tick}</text>
              </g>
            ))}

            {rounds.map((r, i) => (i + 1) % labelEvery === 0 || i === rounds.length - 1 ? (
              <text key={r.round} x={x(i + 1)} y={height - 8} textAnchor="middle" className="fill-zinc-500 text-[10px] font-mono">{r.round}</text>
            ) : null)}

            {visible.map((s) => (
              <path key={s.id} d={pathFor(s.values)} fill="none" stroke={s.color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            ))}

            {visible.map((s) => (
              <circle key={s.id} cx={x(rounds.length)} cy={y(s.values[s.values.length - 1])} r="4" fill={s.color} stroke={SURFACE} strokeWidth="2" />
            ))}

            {endLabels.map((label) => (
              <text key={label.id} x={x(rounds.length) + 9} y={label.y} dy="0.32em" className="fill-zinc-300 text-[10px] font-bold">{label.text}</text>
            ))}

            {hoverIndex !== null && (
              <g pointerEvents="none">
                <line x1={x(hoverIndex)} x2={x(hoverIndex)} y1={MARGIN.top} y2={MARGIN.top + plotH} stroke="#71717a" strokeWidth="1" strokeDasharray="3 3" />
                {visible.map((s) => (
                  <circle key={s.id} cx={x(hoverIndex)} cy={y(s.values[hoverIndex - 1])} r="4" fill={s.color} stroke={SURFACE} strokeWidth="2" />
                ))}
              </g>
            )}

            <rect
              x={MARGIN.left}
              y={MARGIN.top}
              width={plotW}
              height={plotH}
              fill="transparent"
              onPointerMove={handlePointer}
              onPointerDown={handlePointer}
              onPointerLeave={(e) => e.pointerType === "mouse" && setHoverIndex(null)}
            />
          </svg>
        )}

        {hoverIndex !== null && (
          <div
            className="absolute top-2 z-10 min-w-40 bg-zinc-950/95 border border-zinc-700 rounded-lg shadow-2xl px-3 py-2 pointer-events-none"
            style={tooltipOnLeft ? { right: width - x(hoverIndex) + 12 } : { left: x(hoverIndex) + 12 }}
          >
            <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mb-1.5 whitespace-nowrap">
              {dict.results.round} {rounds[hoverIndex - 1].round} • {rounds[hoverIndex - 1].raceName.replace(" Grand Prix", " GP")}
            </div>
            <ul className="flex flex-col gap-1">
              {tooltipRows.map((row) => (
                <li key={row.id} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-0.5 rounded-full shrink-0" style={{ backgroundColor: row.color }} />
                  <span className="font-mono font-bold text-white w-9 text-right">{row.value}</span>
                  <span className="text-zinc-400 whitespace-nowrap">{row.name}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
