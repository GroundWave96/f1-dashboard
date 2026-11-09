"use client";

import React, { useMemo, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";
import { decimal, fill, joinNames, plural } from "../../../i18n/format";
import { type DriverSummary, isQualifyingKind, isRaceKind, type OF1RaceControl, type OF1Weather, type SessionKind } from "../../../lib/openf1";
import { HIGHLIGHT_KINDS, parseRaceControl, type PenaltyType, type RcEvent, type RcKind } from "../../../lib/raceControl";
import SegmentedControl from "../../ui/SegmentedControl";
import BlockCard from "./BlockCard";

const INITIAL_ITEMS = 8;

// Ícone e cor de cada tipo de acontecimento
type Tone = { icon: keyof typeof ICONS; color: string };
const TONES: Record<RcKind, Tone> = {
  start: { icon: "flag", color: "#34d399" },
  finish: { icon: "chequered", color: "#f4f4f5" },
  red: { icon: "flag", color: "#ef4444" },
  resume: { icon: "clock", color: "#a1a1aa" },
  sc: { icon: "sc", color: "#facc15" },
  scIn: { icon: "sc", color: "#a1a1aa" },
  vsc: { icon: "vsc", color: "#facc15" },
  vscEnd: { icon: "vsc", color: "#a1a1aa" },
  penalty: { icon: "alert", color: "#f87171" },
  served: { icon: "check", color: "#a1a1aa" },
  warning: { icon: "flagHalf", color: "#e4e4e7" },
  investigation: { icon: "search", color: "#38bdf8" },
  afterSession: { icon: "search", color: "#a1a1aa" },
  cleared: { icon: "check", color: "#34d399" },
  rain: { icon: "rain", color: "#38bdf8" },
};

const ICONS = {
  flag: <path d="M5 21V4m0 0h11l-2 4 2 4H5" />,
  chequered: <path d="M5 21V4m0 0h12v8H5M9 4v8M13 4v8M5 8h12" />,
  flagHalf: <path d="M5 21V4m0 0h12v8H5m0-4h12M11 4v8" />,
  clock: <path d="M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  alert: <path d="M12 8v5M12 16.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />,
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  search: <path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4" />,
  rain: <path d="M7 15a4 4 0 0 1 .5-8A5.5 5.5 0 0 1 18 8.5a3.5 3.5 0 0 1 0 6.5M9 18l-1 2M13 18l-1 2M17 18l-1 2" />,
  sc: null,
  vsc: null,
};

interface Props {
  rows: DriverSummary[];
  raceControl: OF1RaceControl[];
  weather: OF1Weather[];
  kind: SessionKind | null;
}

/**
 * Linha do tempo da sessão (direção de prova): punições, investigações, safety car e bandeiras,
 * traduzidos e em ordem. Por padrão só os destaques; "Tudo" mostra também investigações e avisos.
 */
export default function RaceTimeline({ rows, raceControl, weather, kind, className }: Props & { className?: string }) {
  const { dict, lang } = useLanguage();
  const t = dict.session.timeline;
  const [chosenFilter, setFilter] = useState<"highlights" | "all" | null>(null);
  const [expanded, setExpanded] = useState(false);
  const race = isRaceKind(kind);

  const { events, deleted } = useMemo(() => parseRaceControl(raceControl), [raceControl]);
  const byNumber = useMemo(() => new Map(rows.map((row) => [row.driver.driver_number, row])), [rows]);

  if (!events.length && !deleted.size && !weather.length) return null;

  const names = (numbers: number[]) => joinNames(numbers.map((n) => byNumber.get(n)?.driver.last_name ?? `#${n}`), t.and, t.andMore);
  const reasonText = (reason?: string) => {
    if (!reason) return null;
    const offence = reason.match(/\((\d+)(?:ST|ND|RD|TH) OFFENCE\)/);
    const key = reason.replace(/\s*\(\d+(?:ST|ND|RD|TH) OFFENCE\)/, "").replace(/\s*[–—]\s*/g, " - ").trim();
    const known = (t.reasons as Record<string, string>)[key];
    // Motivo que a tradução não conhece: o texto da FIA com só a primeira letra maiúscula
    const text = known ?? key.charAt(0) + key.slice(1).toLowerCase();
    return offence ? `${text} (${fill(t.offence, { n: offence[1] })})` : text;
  };
  const penaltyText = (penalty?: PenaltyType) => {
    if (!penalty) return "";
    if (penalty.kind === "time") return fill(t.penaltyTypes.time, { n: penalty.seconds });
    if (penalty.kind === "grid") return fill(t.penaltyTypes.grid, { n: penalty.places });
    return t.penaltyTypes[penalty.kind];
  };

  const titleOf = (event: RcEvent) => {
    const drivers = names(event.drivers);
    switch (event.kind) {
      case "start":
        return race ? t.events.raceStart : t.events.start;
      case "resume":
        return fill(t.events.resume, { time: event.value ?? "" });
      case "rain":
        return fill(t.events.rain, { value: event.value ?? "" });
      case "penalty":
        return event.penalty?.kind === "dsq" ? `${penaltyText(event.penalty)}: ${drivers}` : fill(t.events.penalty, { penalty: penaltyText(event.penalty), drivers });
      default:
        return fill(t.events[event.kind], { drivers });
    }
  };
  const detailOf = (event: RcEvent) => {
    const parts = [event.kind === "served" ? penaltyText(event.penalty) : null, reasonText(event.reason), event.turn ? fill(t.turn, { n: event.turn }) : null].filter(Boolean);
    if (!parts.length) return null;
    const text = parts.join(" · ");
    return text.charAt(0).toLocaleUpperCase(lang) + text.slice(1);
  };
  // Quando: volta na corrida; nos treinos e na qualificação, o horário (e o Q)
  const whenOf = (event: RcEvent) => {
    if (race && event.lap) return fill(t.lapShort, { n: event.lap });
    const time = new Date(event.date).toLocaleTimeString(lang === "pt" ? "pt-BR" : "en-US", { hour: "2-digit", minute: "2-digit" });
    return isQualifyingKind(kind) && event.phase ? `Q${event.phase} · ${time}` : time;
  };

  // Com poucos destaques, abre já mostrando tudo; sem nada além dos destaques, o filtro nem aparece
  const highlights = events.filter((e) => HIGHLIGHT_KINDS.includes(e.kind));
  const filterUseful = events.length > highlights.length && highlights.length > 0;
  const filter = !filterUseful ? "all" : (chosenFilter ?? (highlights.length >= 5 ? "highlights" : "all"));
  const visibleEvents = filter === "highlights" ? highlights : events;
  const shown = expanded ? visibleEvents : visibleEvents.slice(0, INITIAL_ITEMS);

  // Resumo: contagem do que importa; sem nada, "sessão limpa"
  const count = (k: RcKind) => events.filter((e) => e.kind === k).length;
  const deletedTotal = [...deleted.values()].reduce((a, b) => a + b, 0);
  const parts = [
    count("penalty") && plural(count("penalty"), t.penalties),
    count("sc") && plural(count("sc"), t.safetyCars),
    count("vsc") && plural(count("vsc"), t.vscs),
    count("red") && plural(count("red"), t.redFlags),
  ].filter(Boolean) as string[];
  const summary = parts.length
    ? [...parts, deletedTotal ? plural(deletedTotal, t.deletedLaps) : null].filter(Boolean).join(" · ")
    : [t.clean, deletedTotal ? plural(deletedTotal, t.deletedLaps) : null].filter(Boolean).join(" ");

  // Clima da sessão: média da pista e do ar, e se choveu
  const avg = (values: (number | null)[]) => {
    const valid = values.filter((v): v is number => typeof v === "number");
    return valid.length ? valid.reduce((a, b) => a + b, 0) / valid.length : null;
  };
  const trackTemp = avg(weather.map((w) => w.track_temperature));
  const airTemp = avg(weather.map((w) => w.air_temperature));
  const rained = weather.some((w) => (w.rainfall ?? 0) > 0);

  const deletedList = [...deleted.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <BlockCard
      className={className}
      title={t.title}
      summary={summary}
      info={t.info}
      actions={
        filterUseful && (
          <SegmentedControl
            size="sm"
            className="w-44"
            value={filter}
            onChange={(value) => {
              setFilter(value as "highlights" | "all");
              setExpanded(false);
            }}
            ariaLabel={t.title}
            options={[
              { value: "highlights", label: t.highlights },
              { value: "all", label: t.all },
            ]}
          />
        )
      }
    >
      {/* Celular: clima → acontecimentos → voltas anuladas (ordem via "order"; a coluna da direita vira
          "contents"). Telas largas: acontecimentos à esquerda; clima e voltas anuladas numa coluna à direita */}
      <div className={`grid gap-4 ${weather.length > 0 || deletedList.length > 0 ? "@4xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] @4xl:gap-x-8" : ""}`}>
        {(weather.length > 0 || deletedList.length > 0) && (
          <div className="contents @4xl:col-start-2 @4xl:row-start-1 @4xl:flex @4xl:flex-col @4xl:gap-5 @4xl:self-start @4xl:border-l @4xl:border-white/10 @4xl:pl-8">
          {weather.length > 0 && (
            <ul className="order-1 flex flex-wrap content-start gap-1.5 text-[11px] @4xl:order-none">
              {trackTemp !== null && (
                <li className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                  {t.weather.track} <span className="font-mono font-bold text-white">{decimal(trackTemp, lang)} °C</span>
                </li>
              )}
              {airTemp !== null && (
                <li className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-zinc-300">
                  {t.weather.air} <span className="font-mono font-bold text-white">{decimal(airTemp, lang)} °C</span>
                </li>
              )}
              <li className={`rounded-full border px-2.5 py-1 font-bold ${rained ? "border-sky-400/40 bg-sky-400/10 text-sky-300" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}>
                {rained ? t.weather.rain : t.weather.dry}
              </li>
            </ul>
          )}
          {deletedList.length > 0 && (
            <div className="order-3 flex flex-col gap-2 border-t border-white/10 pt-3 @4xl:order-none @4xl:border-t-0 @4xl:pt-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">{t.deletedTitle}</span>
              <ul className="flex flex-wrap gap-1.5">
                {deletedList.map(([number, laps]) => {
                  const row = byNumber.get(number);
                  return (
                    <li key={number} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] py-1 pl-1.5 pr-2.5 text-xs">
                      <span className="h-3.5 w-1 rounded-full" style={{ backgroundColor: row?.color ?? "#71717a" }} aria-hidden="true" />
                      <span className="font-black tracking-wide text-white">{row?.driver.name_acronym ?? `#${number}`}</span>
                      <span className="font-mono font-bold text-zinc-300">{laps}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="text-[11px] text-muted text-pretty">{t.deletedNote}</p>
            </div>
          )}
          </div>
        )}
        <div className="@container order-2 flex flex-col gap-4 @4xl:order-none @4xl:col-start-1 @4xl:row-start-1">
          {visibleEvents.length > 0 ? (
            <ol className={`relative flex flex-col ${shown.length >= 8 ? "@2xl:block @2xl:columns-2 @2xl:gap-x-10" : ""}`}>
              {shown.map((event, index) => {
                const tone = TONES[event.kind];
                const detail = detailOf(event);
                const last = index === shown.length - 1;
                return (
                  <li key={event.id} className={`grid break-inside-avoid gap-x-2.5 ${race ? "grid-cols-[2.75rem_1.75rem_minmax(0,1fr)]" : "grid-cols-[4.75rem_1.75rem_minmax(0,1fr)]"}`}>
                    <span className="whitespace-nowrap pt-1 text-right font-mono text-[11px] font-bold tabular-nums text-muted">{whenOf(event)}</span>
                    {/* Ícone sobre a linha vertical que liga os acontecimentos */}
                    <span className="relative flex justify-center">
                      {!last && <span className="absolute top-7 bottom-0 w-px bg-white/10" aria-hidden="true" />}
                      <span
                        className="relative flex h-7 w-7 items-center justify-center rounded-full border text-[8px] font-black"
                        style={{ color: tone.color, borderColor: `${tone.color}55`, backgroundColor: `${tone.color}1a` }}
                        aria-hidden="true"
                      >
                        {tone.icon === "sc" ? "SC" : tone.icon === "vsc" ? "VSC" : (
                          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {ICONS[tone.icon]}
                          </svg>
                        )}
                      </span>
                    </span>
                    <span className={`flex min-w-0 flex-col gap-0.5 ${last ? "" : "pb-3.5"} pt-0.5`}>
                      <span className="text-sm font-semibold leading-snug text-white text-pretty">{titleOf(event)}</span>
                      {detail && <span className="text-xs leading-snug text-zinc-400 text-pretty">{detail}</span>}
                    </span>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p className="text-sm text-muted">{t.empty}</p>
          )}

          {visibleEvents.length > INITIAL_ITEMS && (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="tap self-start rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-[background-color,scale] duration-150 hover:bg-white/10 active:scale-[0.96]"
            >
              {expanded ? t.showLess : fill(t.showAll, { n: visibleEvents.length })}
            </button>
          )}
        </div>
      </div>
    </BlockCard>
  );
}
