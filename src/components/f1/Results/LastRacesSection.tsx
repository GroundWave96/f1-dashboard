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

    useEffect(() => {
        async function fetchAllResults() {
            try {
                const response = await api.get("current/results.json?limit=1000");
                const allRaces: PastRace[] = response.data.MRData.RaceTable.Races;
                setRaces(allRaces);
                setCurrentIndex(allRaces.length - 1); // Começa na última corrida
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchAllResults();
    }, []);

    const goToPrevious = () => {
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    const goToNext = () => {
        if (currentIndex < races.length - 1) setCurrentIndex(currentIndex + 1);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando resultados oficiais...</span>
            </div>
        );
    }

    if (races.length === 0) return null;

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
            />

            <ResultsTable results={currentRace.Results} />

        </div>
    );
}