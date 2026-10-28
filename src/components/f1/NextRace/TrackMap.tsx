"use client";

import React from "react";
import { useAsyncData, useReducedMotion } from "../../../lib/hooks";
import { loadTrackPath } from "../../../lib/circuit";
import { countryToISO } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface TrackMapProps {
    circuitId: string;
    country: string;
}

// Traçado genérico usado quando o circuito ainda não tem SVG
const PLACEHOLDER_PATH = "M150 110 H350 A90 90 0 0 1 440 200 V300 A90 90 0 0 1 350 390 H150 A90 90 0 0 1 60 300 V200 A90 90 0 0 1 150 110 Z";

export default function TrackMap({ circuitId, country }: TrackMapProps) {
    const { dict } = useLanguage();
    const reducedMotion = useReducedMotion();
    const { data: trackPath, loading } = useAsyncData(`track:${circuitId}`, () => loadTrackPath(circuitId));

    if (loading) {
        return (
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <div className="w-1/2 aspect-square max-w-48 bg-zinc-800/30 rounded-full blur-2xl"></div>
            </div>
        );
    }

    if (!trackPath) {
        return (
            <div className="absolute inset-0">
                <svg viewBox="0 0 500 500" className="w-full h-full" aria-hidden="true">
                    <path d={PLACEHOLDER_PATH} fill="none" stroke="#3f3f46" strokeWidth="14" strokeLinejoin="round" strokeDasharray="1 26" strokeLinecap="round" />
                    {!reducedMotion && (
                        <circle r="8" fill="#FB2C36" opacity="0.7">
                            <animateMotion dur="5s" repeatCount="indefinite" path={PLACEHOLDER_PATH} />
                        </circle>
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={`https://flagcdn.com/w80/${countryToISO(country)}.png`}
                        alt={country}
                        className="w-12 h-auto rounded shadow-lg opacity-90"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                        {dict.nextRace.trackUnavailable}
                    </span>
                </div>
            </div>
        );
    }

    // O SVG ocupa todo o espaço disponível (o card decide o tamanho) e mantém a proporção
    return (
        <div className="absolute inset-0">
            <svg viewBox="-15 -15 530 530" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]" aria-hidden="true">

                <path
                    d={trackPath}
                    pathLength={1}
                    className="draw-on-view"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="22"
                    strokeLinejoin="round"
                    strokeOpacity="0.8"
                />

                <path
                    d={trackPath}
                    pathLength={1}
                    className="draw-on-view"
                    fill="none"
                    stroke="#18181b"
                    strokeWidth="8"
                    strokeLinejoin="round"
                />

                {/* Carro dando voltas na pista; com "reduzir movimento" ele fica parado na largada */}
                <circle r="8" fill="#FB2C36" className="drop-shadow-[0_0_12px_#FB2C36]">
                    {reducedMotion ? (
                        <animateMotion dur="1s" fill="freeze" keyPoints="0;0" keyTimes="0;1" calcMode="linear" path={trackPath} />
                    ) : (
                        <animateMotion dur="3.3s" repeatCount="indefinite" path={trackPath} />
                    )}
                </circle>

            </svg>
        </div>
    );
}
