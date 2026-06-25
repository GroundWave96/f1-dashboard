"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PastRace } from "../../../types/f1";
import RaceNavigation from "./RaceNavigation";
import ResultsTable from "./ResultsTable";
import Footer from "../../layout/Footer";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";

export default function LastRacesSection() {
    const [races, setRaces] = useState<PastRace[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [season, setSeason] = useState<string>("current");
    const { dict } = useLanguage();

    useEffect(() => {
        async function fetchAllResults() {
            setLoading(true);
            setError(false);
            try {
                const allRacesMap: Record<string, PastRace> = {};
                let offset = 0;
                const limit = 100;
                let total = 1;
                
                while (offset < total) {
                    const response = await api.get(`${season}/results.json?limit=${limit}&offset=${offset}`);
                    const data = response.data.MRData;
                    
                    total = parseInt(data.total);
                    const fetchedRaces = data.RaceTable.Races;
                    
                    for (const race of fetchedRaces) {
                        if (allRacesMap[race.round]) {
                            allRacesMap[race.round].Results = [
                                ...allRacesMap[race.round].Results,
                                ...race.Results
                            ];
                        } else {
                            allRacesMap[race.round] = race;
                        }
                    }
                    
                    offset += limit;
                }

                const allRaces = Object.values(allRacesMap).sort(
                    (a: PastRace, b: PastRace) => Number(a.round) - Number(b.round)
                );

                setRaces(allRaces);
                setCurrentIndex(allRaces.length - 1);
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
                setError(true);
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
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <Spinner />
                <span>{dict.results.loading} {season === "current" ? new Date().getFullYear() : season}...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
                <span className="text-zinc-500 text-xs text-center px-4 mb-4">
                    {dict.errors.resultsMsg}
                </span>
                <button
                    onClick={() => setSeason("current")}
                    className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors"
                >
                    {dict.errors.tryAgain}
                </button>
            </div>
        );
    }

    if (races.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <span>{dict.results.noRaces}</span>
                <button onClick={() => setSeason("current")} className="text-red-500 underline">{dict.results.backToCurrent}</button>
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

            <Footer />

        </div>
    );
}