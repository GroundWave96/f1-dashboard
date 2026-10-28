"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Constructor } from "../../../types/f1";
import { getConstructorLogo, translateNationality } from "../../../lib/f1-utils";
import { fetchWikiSummary, firstSentences } from "../../../lib/wikipedia";
import { loadConstructorCareer } from "../../../lib/career";
import { useAsyncData, useDialog } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import StatTiles from "../../ui/StatTiles";
import TeammateDuel from "./TeammateDuel";

interface ConstructorModalProps {
    constructorData: Constructor;
    // Temporada usada no duelo entre companheiros ("current" ou o ano)
    season: string;
    onClose: () => void;
}

export default function ConstructorModal({ constructorData, season, onClose }: ConstructorModalProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { dict, lang } = useLanguage();
    const { data: career } = useAsyncData(`career:team:${constructorData.constructorId}`, () => loadConstructorCareer(constructorData.constructorId));

    useEffect(() => {
        let cancelled = false;

        async function fetchWikiData() {
            setLoading(true);
            try {
                const fallbackTerm = lang === 'pt' ? `${constructorData.name} (Fórmula 1)` : `${constructorData.name} Formula One team`;
                const data = await fetchWikiSummary(lang, constructorData.url, [fallbackTerm, constructorData.name]);
                if (cancelled) return;

                setSummary(data ? firstSentences(data.extract, 3) : null);
            } catch (error) {
                console.error("Erro ao buscar dados na Wikipédia:", error);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        fetchWikiData();

        return () => {
            cancelled = true;
        };
    }, [constructorData, lang]);

    useDialog(onClose);

    // Renderizado direto no <body>: nenhum container da página interfere na posição do modal
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-white" role="dialog" aria-modal="true" aria-label={constructorData.name}>
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-sm max-h-[92dvh] overflow-y-auto custom-scrollbar bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl shadow-2xl p-6 pt-8 animate-in motion-safe:zoom-in-95 duration-200">
                <button
                    type="button"
                    autoFocus
                    onClick={onClose}
                    aria-label={dict.driverModal.close}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-red-500 rounded-full p-2 transition-colors z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {loading ? (
                    <div className="h-90 flex flex-col items-center justify-center gap-4">
                        <Spinner />
                        <span className="text-sm text-zinc-400 font-medium animate-pulse">{dict.driverModal.loadingBio}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center mt-2">
                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center bg-zinc-800/50 rounded-2xl border border-zinc-700/50 p-4 shadow-inner">
                            <div className="absolute inset-0 bg-linear-to-tr from-zinc-700 to-zinc-600 rounded-2xl blur-xl opacity-20"></div>
                            <Image
                                src={getConstructorLogo(constructorData.constructorId)}
                                alt={constructorData.name}
                                width={100}
                                height={100}
                                className="relative w-full h-full object-contain drop-shadow-2xl brightness-125"
                                unoptimized
                            />
                        </div>

                        <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-5">
                            {constructorData.name}
                        </h3>

                        <div className="flex gap-3 mb-5 w-full justify-center">
                            <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700/50 min-w-36">
                                <span className="block text-[10px] text-muted uppercase tracking-wider font-bold mb-0.5">{dict.driverModal.nationality}</span>
                                <span className="text-white text-sm capitalize truncate block">
                                    {translateNationality(constructorData.nationality, lang as 'pt' | 'en')}
                                </span>
                            </div>
                        </div>

                        <StatTiles
                            title={dict.driverModal.career}
                            stats={[
                                { label: dict.driverModal.wins, value: career?.wins },
                                { label: dict.driverModal.podiums, value: career?.podiums },
                                { label: dict.driverModal.poles, value: career?.poles },
                            ]}
                        />

                        <TeammateDuel constructorData={constructorData} season={season} />

                        <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-4 w-full max-h-40 overflow-y-auto custom-scrollbar">
                            {summary ? (
                                <p className="text-xs text-zinc-300 leading-relaxed text-left">
                                    {summary}
                                </p>
                            ) : (
                                <p className="text-sm text-muted italic">
                                    {dict.driverModal.bioNotFoundTeam || "Biografia não encontrada para esta equipe."}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
