import React from "react";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";

interface RaceNavigationProps {
    currentRace: PastRace;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    selectedSeason: string;
    onSeasonChange: (season: string) => void;
    viewMode?: "races" | "drivers" | "constructors"; // Agora temos 3 modos
}

export default function RaceNavigation({
    currentRace,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    selectedSeason,
    onSeasonChange,
    viewMode = "races"
}: RaceNavigationProps) {
    const { dict, lang } = useLanguage();
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
         
    const raceDateObj = new Date(`${currentRace.date}T${currentRace.time || "00:00:00Z"}`);
    const formattedDate = raceDateObj.toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(currentYear - 1950 + 1), (val, index) => currentYear - index);

    // É classificação se não for a aba de corridas
    const isStandings = viewMode !== "races";

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div className="w-full sm:w-auto">
                <div className="flex justify-between items-center sm:items-start mb-1">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
                        {isStandings 
                            ? `${dict.standings.season} ${selectedSeason === "current" ? currentYear : selectedSeason}`
                            : `${dict.results.round} ${currentRace.round} • ${formattedDate}`
                        }
                    </span>
                    
                    <div className="sm:hidden relative">
                        <select
                            id="season-mobile"
                            name="season-mobile"
                            aria-label="Selecionar temporada (mobile)"
                            value={selectedSeason}
                            onChange={(e) => onSeasonChange(e.target.value)}
                            className="appearance-none bg-zinc-800 text-white text-xs font-bold py-1 px-3 pr-6 rounded-full border border-zinc-700 outline-none focus:border-red-500 cursor-pointer"
                        >
                            <option value="current">{dict.results.current}</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {isStandings ? dict.standings.title : currentRace.raceName}
                </h2>
                
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <p className="text-gray-400 text-sm">
                        {/* Se for tabela, mostra "Pilotos" ou "Equipes". Se for corrida, mostra o nome do circuito */}
                        {isStandings 
                            ? (viewMode === "drivers" ? dict.standings.drivers : dict.standings.teams) 
                            : currentRace.Circuit.circuitName}
                    </p>
                    
                    <div className="hidden sm:block relative">
                        <select
                            id="season-desktop"
                            name="season-desktop"
                            aria-label="Selecionar temporada (desktop)"
                            value={selectedSeason}
                            onChange={(e) => onSeasonChange(e.target.value)}
                            className="appearance-none bg-zinc-800 text-white text-xs font-bold py-1 px-3 pr-6 rounded-full border border-zinc-700 outline-none focus:border-red-500 cursor-pointer transition-colors hover:bg-zinc-700"
                        >
                            <option value="current">{dict.results.currentSeason}</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                        </div>
                    </div>
                </div>
            </div>
            
            {!isStandings && (
                <div className="flex justify-between sm:justify-center w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                    <button
                        onClick={onPrevious}
                        disabled={!hasPrevious}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded transition-all font-bold text-sm ${
                            hasPrevious 
                            ? "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600" 
                            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        &larr; {dict.results.previous}
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!hasNext}
                        className={`flex-1 sm:flex-none px-4 py-2 rounded transition-all font-bold text-sm ${
                            hasNext 
                            ? "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600" 
                            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
                        }`}
                    >
                        {dict.results.next} &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}