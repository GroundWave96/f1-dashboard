"use client";

import React, { useEffect, useState } from "react";
import { Driver } from "../../../types/f1";
import { nationalityToISO } from "../../../lib/f1-utils";

interface DriverModalProps {
    driver: Driver;
    constructorName: string;
    onClose: () => void;
}

export default function DriverModal({ driver, constructorName, onClose }: DriverModalProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [summary, setSummary] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Função para calcular a idade real baseada na data de nascimento
    const getAge = (dob?: string) => {
        if (!dob) return "--";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    useEffect(() => {
        async function fetchWikiData() {
            setLoading(true);
            try {
                const fullName = `${driver.givenName} ${driver.familyName}`;
                
                // 1. Primeira tentativa de busca na Wikipédia
                let wikiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fullName)}`;
                let res = await fetch(wikiUrl);
                let data = await res.json();

                // 2. Se a Wiki ficar confusa (Página de desambiguação) ou não achar
                if (data.type === "disambiguation" || data.title === "Not found") {
                    // Plano B: Tenta buscar especificamente pelo automobilista
                    wikiUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(fullName + " (automobilista)")}`;
                    res = await fetch(wikiUrl);
                    data = await res.json();
                }

                if (data.thumbnail && data.thumbnail.source) {
                    setImageUrl(data.thumbnail.source);
                }
                
                if (data.extract) {
                    // Pega as 3 primeiras frases (para ter mais conteúdo)
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
    }, [driver]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Fundo escurecido e clicável para fechar */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* O Modal Principal com Glassmorphism aprimorado */}
            <div className="relative w-full max-w-sm bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl shadow-2xl p-6 pt-8 overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Número do Piloto (Estilo F1 moderno) */}
                {driver.permanentNumber && (
                    <div className="absolute top-4 left-4 bg-white text-zinc-950 font-black italic text-xl px-3 py-0.5 rounded shadow-lg border border-white/20 transform -skew-x-12 z-10">
                        #{driver.permanentNumber}
                    </div>
                )}

                {/* Botão Fechar */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-800/80 hover:bg-red-500 rounded-full p-2 transition-all z-10"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>

                {/* Conteúdo Dinâmico */}
                {loading ? (
                    <div className="h-[360px] flex flex-col items-center justify-center gap-4">
                        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-sm text-zinc-400 font-medium animate-pulse">Consultando base de dados...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center text-center mt-2">
                        
                        {/* Foto flutuante estilo Avatar */}
                        <div className="relative w-32 h-32 mb-5">
                            {/* Efeito de brilho vermelho no fundo da foto */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-red-600 to-red-400 rounded-full blur-lg opacity-40"></div>
                            <img 
                                src={imageUrl || `https://ui-avatars.com/api/?name=${driver.givenName}+${driver.familyName}&background=18181b&color=ef4444&size=200`} 
                                alt={driver.familyName}
                                className="relative w-full h-full object-cover rounded-full border-2 border-zinc-600 shadow-2xl"
                            />
                            {/* Bandeira no canto da foto */}
                            <img
                                src={`https://flagcdn.com/w40/${nationalityToISO(driver.nationality)}.png`}
                                alt={driver.nationality}
                                className="absolute bottom-0 right-1 w-8 h-auto rounded-sm border border-zinc-800 shadow-lg"
                            />
                        </div>

                        {/* Nome e Equipe */}
                        <h3 className="text-2xl font-bold text-white uppercase tracking-tight mb-1">
                            {driver.givenName} <span className="text-red-500">{driver.familyName}</span>
                        </h3>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-5">
                            {constructorName}
                        </p>

                        {/* Badges de Informações Fixas */}
                        <div className="flex gap-3 mb-5 w-full justify-center">
                            <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700/50 w-28">
                                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Idade</span>
                                <span className="text-white font-mono">{getAge(driver.dateOfBirth)} anos</span>
                            </div>
                            <div className="bg-zinc-800/50 rounded-lg px-4 py-2 border border-zinc-700/50 w-36">
                                <span className="block text-[10px] text-zinc-500 uppercase tracking-wider font-bold mb-0.5">Nacionalidade</span>
                                <span className="text-white text-sm capitalize truncate block">{driver.nationality}</span>
                            </div>
                        </div>

                        {/* Resumo da Wikipédia (com rolagem se for muito grande) */}
                        <div className="bg-zinc-950/60 border border-zinc-800/50 rounded-xl p-4 w-full max-h-36 overflow-y-auto custom-scrollbar">
                            {summary ? (
                                <p className="text-xs text-zinc-300 leading-relaxed text-left">
                                    {summary}
                                </p>
                            ) : (
                                <p className="text-sm text-zinc-500 italic">Informações biográficas detalhadas não encontradas.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}