"use client";

import React, { useEffect, useState } from "react";

interface TrackMapProps {
    circuitId: string;
}

// circuitIds da API cujo arquivo em /public/circuits tem outro nome
const circuitFileAliases: Record<string, string> = {
    albert_park: "albert-park",
    madring: "madrid",
};

export default function TrackMap({ circuitId }: TrackMapProps) {
    const [trackPath, setTrackPath] = useState<string | null>(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        async function fetchSvg() {
            try {
                const fileName = circuitFileAliases[circuitId] ?? circuitId;
                const res = await fetch(`/circuits/${fileName}.svg`);
                if (!res.ok) throw new Error(`SVG do circuito "${circuitId}" não encontrado`);
                const text = await res.text();
                
                const match = text.match(/d="([^"]+)"/);
                if (!match || !match[1]) throw new Error(`Traçado do circuito "${circuitId}" não encontrado`);
                setTrackPath(match[1]);
            } catch (error) {
                console.error("Erro ao extrair o traçado da pista:", error);
                setNotFound(true);
            }
        }
        fetchSvg();
    }, [circuitId]);

    if (notFound) return null;

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

                <circle r="8" fill="#FB2C36" className="drop-shadow-[0_0_12px_#FB2C36]">
                    <animateMotion dur="3.3s" repeatCount="indefinite" path={trackPath} />
                </circle>

            </svg>
        </div>
    );
}