"use client";

import React from "react";
import { useAsyncData } from "../../../lib/hooks";
import { countryToISO } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface TrackMapProps {
    circuitId: string;
    country: string;
}

// O arquivo em /public/circuits deve ter exatamente o circuitId da API (ex.: "albert_park.svg").
// `npm run check:assets` lista os circuitos do calendário que ainda não têm SVG.
async function loadTrackPath(circuitId: string): Promise<string | null> {
    const res = await fetch(`/circuits/${circuitId}.svg`);
    if (!res.ok) return null;
    const text = await res.text();
    return text.match(/d="([^"]+)"/)?.[1] ?? null;
}

// Traçado genérico usado quando o circuito ainda não tem SVG
const PLACEHOLDER_PATH = "M150 110 H350 A90 90 0 0 1 440 200 V300 A90 90 0 0 1 350 390 H150 A90 90 0 0 1 60 300 V200 A90 90 0 0 1 150 110 Z";

export default function TrackMap({ circuitId, country }: TrackMapProps) {
    const { dict } = useLanguage();
    const { data: trackPath, loading } = useAsyncData(`track:${circuitId}`, () => loadTrackPath(circuitId));

    if (loading) {
        return (
            <div className="w-full h-full flex items-center justify-center animate-pulse min-h-40">
                <div className="w-32 h-32 bg-zinc-800/30 rounded-full blur-2xl"></div>
            </div>
        );
    }

    if (!trackPath) {
        return (
            <div className="w-full h-full flex items-center justify-center relative p-4">
                <svg viewBox="0 0 500 500" className="w-full h-auto max-h-62.5 sm:max-h-75" aria-hidden="true">
                    <path d={PLACEHOLDER_PATH} fill="none" stroke="#3f3f46" strokeWidth="14" strokeLinejoin="round" strokeDasharray="1 26" strokeLinecap="round" />
                    <circle r="8" fill="#FB2C36" opacity="0.7">
                        <animateMotion dur="5s" repeatCount="indefinite" path={PLACEHOLDER_PATH} />
                    </circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://flagcdn.com/w80/${countryToISO(country)}.png`}
                        alt={country}
                        className="w-12 h-auto rounded shadow-lg opacity-90"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        {dict.nextRace.trackUnavailable}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center relative p-4">
            <svg viewBox="0 0 500 500" className="w-full h-auto max-h-62.5 sm:max-h-75 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" aria-hidden="true">

                <path
                    d={trackPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="22"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                />

                <path
                    d={trackPath}
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="8"
                    strokeLinejoin="round"
                />

                <circle r="8" fill="#FB2C36" className="drop-shadow-[0_0_12px_#FB2C36]">
                    <animateMotion dur="3.3s" repeatCount="indefinite" path={trackPath} />
                </circle>

            </svg>
        </div>
    );
}
