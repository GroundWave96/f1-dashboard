"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { PastRace, DriverStanding, ConstructorStanding, Driver } from "../../../types/f1";
import RaceNavigation from "./RaceNavigation";
import ResultsTable from "./ResultsTable";
import Footer from "../../layout/Footer";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import DriverTable from "../Standings/DriverTable"; 
import ConstructorTable from "../Standings/ConstructorTable"; // <-- Importe a tabela de Equipes
import DriverModal from "../Standings/DriverModal";

export default function LastRacesSection() {
    const [races, setRaces] = useState<PastRace[]>([]);
    const [standings, setStandings] = useState<DriverStanding[]>([]);
    const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]); // Estado das Equipes
    
    // Agora o ViewMode aceita 3 opções
    const [viewMode, setViewMode] = useState<"races" | "drivers" | "constructors">("races");
    
    const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, constructorName: string } | null>(null);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);
    const [season, setSeason] = useState<string>("current");
    
    const { dict } = useLanguage();

    useEffect(() => {
        async function fetchSeasonData() {
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

                // Executa as duas consultas de classificação simultaneamente para economizar tempo
                const [standingsRes, constructorsRes] = await Promise.all([
                    api.get(`${season}/driverStandings.json`),
                    api.get(`${season}/constructorStandings.json`)
                ]);
                
                const seasonStandings = standingsRes.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
                const seasonConstructors = constructorsRes.data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || [];

                setRaces(allRaces);
                setStandings(seasonStandings);
                setConstructorStandings(seasonConstructors);
                
                setCurrentIndex(allRaces.length - 1);
                setViewMode("races"); 

            } catch (error) {
                console.error("Erro ao buscar dados da temporada:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        
        fetchSeasonData();
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
                    viewMode={viewMode}
                />
            </div>

            {/* Toggle de 3 opções: Corridas | Pilotos | Equipes */}
            <div className="flex justify-center mb-4 px-2">
                <div className="relative bg-zinc-900 p-1 rounded-full border border-zinc-800 flex items-center w-full max-w-sm h-11">
                    <div
                        className={`absolute h-9 w-[calc(33.33%-4px)] bg-zinc-700 rounded-full shadow-lg transition-transform duration-300 ease-in-out z-0 ${
                            viewMode === "races" ? "translate-x-0" : viewMode === "drivers" ? "translate-x-full" : "translate-x-[200%]"
                        }`}
                    />
                    <button
                        onClick={() => setViewMode("races")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${viewMode === "races" ? "text-white" : "text-gray-500"}`}
                    >
                        {dict.results.racesTab}
                    </button>
                    <button
                        onClick={() => setViewMode("drivers")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${viewMode === "drivers" ? "text-white" : "text-gray-500"}`}
                    >
                        {dict.standings.drivers}
                    </button>
                    <button
                        onClick={() => setViewMode("constructors")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${viewMode === "constructors" ? "text-white" : "text-gray-500"}`}
                    >
                        {dict.standings.teams}
                    </button>
                </div>
            </div>

            {/* NOVOS BOTÕES EXCLUSIVOS PARA MOBILE */}
            {viewMode === "races" && (
                <div className="flex sm:hidden justify-between w-full max-w-sm mx-auto gap-3 px-2 mb-4">
                    <button
                        onClick={goToPrevious}
                        disabled={!hasPrevious}
                        className={`flex-1 px-4 py-2 rounded transition-all font-bold text-sm ${
                            hasPrevious 
                            ? "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600" 
                            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        &larr; {dict.results.previous}
                    </button>
                    <button
                        onClick={goToNext}
                        disabled={!hasNext}
                        className={`flex-1 px-4 py-2 rounded transition-all font-bold text-sm ${
                            hasNext 
                            ? "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600" 
                            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        {dict.results.next} &rarr;
                    </button>
                </div>
            )}

            <div className="relative flex-1 min-h-0 w-full mb-3 sm:mb-4">
                {viewMode === "races" && <ResultsTable results={currentRace.Results} />}
                {viewMode === "drivers" && (
                    <DriverTable 
                        standings={standings} 
                        onRowClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })} 
                    /> 
                )}
                {viewMode === "constructors" && <ConstructorTable standings={constructorStandings} />}
            </div>
            
            {selectedDriver && (
                <DriverModal
                    driver={selectedDriver.driver}
                    constructorName={selectedDriver.constructorName}
                    onClose={() => setSelectedDriver(null)}
                />
            )}
            
            <Footer />
        </div>
    );
}