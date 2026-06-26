"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Constructor } from "../../../types/f1";
import { getConstructorLogo, translateNationality } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";

interface ConstructorModalProps {
    constructorData: Constructor;
    onClose: () => void;
}

export default function ConstructorModal({ constructorData, onClose }: ConstructorModalProps) {
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const { dict, lang } = useLanguage();

    const getWikiTitle = (id: string, name: string, lang: string) => {
        const exactTitles: Record<string, { pt: string, en: string }> = {
            'mercedes': { pt: 'Mercedes-Benz_na_Fórmula_1', en: 'Mercedes-Benz_in_Formula_One' },
            'red_bull': { pt: 'Red_Bull_Racing', en: 'Red_Bull_Racing' },
            'ferrari': { pt: 'Scuderia_Ferrari', en: 'Scuderia_Ferrari' },
            'mclaren': { pt: 'McLaren', en: 'McLaren' },
            'aston_martin': { pt: 'Aston_Martin_F1_Team', en: 'Aston_Martin_in_Formula_One' },
            'alpine': { pt: 'Alpine_F1_Team', en: 'Alpine_F1_Team' },
            'williams': { pt: 'Williams_Grand_Prix_Engineering', en: 'Williams_Racing' },
            'rb': { pt: 'Racing_Bulls', en: 'RB_Formula_One_Team' },
            'sauber': { pt: 'Sauber_Motorsport', en: 'Sauber_Motorsport' },
            'haas': { pt: 'Haas_F1_Team', en: 'Haas_F1_Team' },
            'audi': { pt: 'Audi_Sport', en: 'Audi_in_Formula_One' },
            'cadillac': { pt: 'Andretti_Global', en: 'Andretti_Global' }
        };

        if (exactTitles[id]) {
            return exactTitles[id][lang as 'pt' | 'en'];
        }
        return name;
    };

    useEffect(() => {
        async function fetchWikiData() {
            setLoading(true);
            try {
                const mappedTitle = getWikiTitle(constructorData.constructorId, constructorData.name, lang);
                let wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(mappedTitle)}`;
                
                let res = await fetch(wikiUrl);
                let data = await res.json();

                if (data.type === "disambiguation" || data.title === "Not found") {
                    const fallbackTerm = lang === 'pt' ? `${constructorData.name} (Fórmula 1)` : `${constructorData.name} Formula One team`;
                    wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fallbackTerm)}`;
                    res = await fetch(wikiUrl);
                    data = await res.json();
                }

                if (data.extract) {
                    const sentences = data.extract.split('. ');
                    setSummary(sentences.slice(0, 3).join('. ') + '.');
                }
            } catch (error) {
                console.error("Erro ao buscar dados na Wikipédia:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchWikiData();
    }, [constructorData, lang]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            <div className="relative w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl shadow-2xl p-6 pt-8 overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-red-500 rounded-full p-2 transition-all z-10"
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

                        <div className="flex gap-3 mb-6 w-full justify-center">
                            <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700/50 min-w-36">
                                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">{dict.driverModal.nationality}</span>
                                <span className="text-white text-sm capitalize truncate block">
                                    {translateNationality(constructorData.nationality, lang as 'pt' | 'en')}
                                </span>
                            </div>
                        </div>

                        <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-4 w-full max-h-40 overflow-y-auto custom-scrollbar">
                            {summary ? (
                                <p className="text-xs text-zinc-300 leading-relaxed text-left">
                                    {summary}
                                </p>
                            ) : (
                                <p className="text-sm text-zinc-500 italic">
                                    {dict.driverModal.bioNotFoundTeam || "Biografia não encontrada para esta equipe."}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}