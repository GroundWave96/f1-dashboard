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
    // Novo estado para controlar a temporada selecionada
    const [season, setSeason] = useState<string>("current"); 

    // O useEffect agora depende da variável 'season'
    useEffect(() => {
        async function fetchAllResults() {
            setLoading(true);
            try {
                // A API permite passar o ano na URL. Ex: "2021/results.json"
                const response = await api.get(`${season}/results.json?limit=1000`);
                const allRaces: PastRace[] = response.data.MRData.RaceTable.Races;
                setRaces(allRaces);
                // Sempre que muda de ano, começa mostrando a última corrida daquele ano
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

    // Função que será repassada para o menu de navegação
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
        <div className="w-full max-w-4xl mx-auto px-2">
            <RaceNavigation 
                currentRace={currentRace}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPrevious={goToPrevious}
                onNext={goToNext}
                selectedSeason={season}
                onSeasonChange={handleSeasonChange}
            />

            <ResultsTable results={currentRace.Results} />
        </div>
    );
}