"use client";

import React, { useEffect, useState } from "react";

interface TrackMapProps {
    circuitId: string;
}

export default function TrackMap({ circuitId }: TrackMapProps) {
    const [trackPath, setTrackPath] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSvg() {
            try {
                const res = await fetch(`/circuits/${circuitId}.svg`);
                const text = await res.text();
                
                const match = text.match(/d="([^"]+)"/);
                if (match && match[1]) {
                    setTrackPath(match[1]);
                }
            } catch (error) {
                console.error("Erro ao extrair o traçado da pista:", error);
            }
        }
        fetchSvg();
    }, [circuitId]);

    if (!trackPath) {
        return (
            <div className="w-full h-full flex items-center justify-center animate-pulse">
                <div className="w-32 h-32 bg-zinc-800/30 rounded-full blur-2xl"></div>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center relative p-4">
            <svg viewBox="0 0 500 500" className="w-full h-auto max-h-62.5 sm:max-h-75 drop-shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                
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

                <circle r="8" fill="#ef4444" className="drop-shadow-[0_0_12px_rgba(239,68,68,1)]">
                    <animateMotion dur="3.3s" repeatCount="indefinite" path={trackPath} />
                </circle>

            </svg>
        </div>
    );
}