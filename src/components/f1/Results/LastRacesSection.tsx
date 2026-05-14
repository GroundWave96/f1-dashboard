"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PastRace } from "../../../types/f1";
import RaceNavigation from "./RaceNavigation";
import ResultsTable from "./ResultsTable";

export default function LastRacesSection() {
    const [races, setRaces] = useState<PastRace[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [season, setSeason] = useState<string>("current");

    useEffect(() => {
        async function fetchAllResults() {
            setLoading(true);
            try {
                const response = await api.get(`${season}/results.json?limit=1000`);
                const allRaces: PastRace[] = response.data.MRData.RaceTable.Races.sort((a: PastRace, b: PastRace) => Number(a.round) - Number(b.round));
                setRaces(allRaces);
                setCurrentIndex(allRaces.length - 1);
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllResults();
    }, [season]);

    const goToPrevious = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const goToNext = () => {
        if (currentIndex < races.length - 1) setCurrentIndex(currentIndex + 1);
    };

    const handleSeasonChange = (newSeason: string) => {
        setSeason(newSeason);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando resultados da temporada {season === "current" ? new Date().getFullYear() : season}...</span>
            </div>
        );
    }

    if (races.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <span>Nenhuma corrida encontrada para esta temporada.</span>
                <button onClick={() => setSeason("current")} className="text-red-500 underline">Voltar para a atual</button>
            </div>
        );
    }

    const currentRace = races[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < races.length - 1;

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col h-full py-4 sm:py-6">
            
            <div className="shrink-0">
                <RaceNavigation
                    currentRace={currentRace}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                    selectedSeason={season}
                    onSeasonChange={handleSeasonChange}
                />
            </div>

            <div className="relative flex-1 min-h-0 w-full mb-3 sm:mb-4">
                <ResultsTable results={currentRace.Results} />
            </div>

            <div className="shrink-0 text-center">
                <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-medium">
                    Designed & Developed by{" "}
                    <a 
                        href="https://gabrielpimentel.vercel.app/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="relative inline-block text-red-500 hover:text-red-400 transition-colors font-bold after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1.5px] after:bottom-0 after:left-0 after:bg-red-500 after:origin-bottom-left after:transition-transform after:duration-300 hover:after:scale-x-100"
                        title="Ver Portfólio de Gabriel Pimentel"
                    >
                        Gabriel Pimentel
                    </a>
                </p>
            </div>

        </div>
    );
}