import React from "react";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";
import Select from "../../ui/Select";

interface RaceNavigationProps {
    currentRace: PastRace;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    selectedSeason: string;
    onSeasonChange: (season: string) => void;
    viewMode?: "races" | "drivers" | "constructors";
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
    const yearOptions = Array.from(new Array(currentYear - 1950), (_, index) => {
        const year = String(currentYear - 1 - index);
        return { value: year, label: year };
    });

    const isStandings = viewMode !== "races";

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div className="w-full sm:w-auto">
                <div className="flex justify-between items-center sm:items-start mb-1">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
                        {isStandings 
                            ? `${dict.standings.season} ${currentRace.season}`
                            : `${dict.results.round} ${currentRace.round} • ${formattedDate}`
                        }
                    </span>
                    
                    <div className="sm:hidden">
                        <Select
                            value={selectedSeason}
                            options={[{ value: "current", label: dict.results.current }, ...yearOptions]}
                            onChange={onSeasonChange}
                            ariaLabel={dict.results.selectSeason}
                            align="right"
                        />
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {isStandings ? dict.standings.title : currentRace.raceName}
                </h2>
                
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <p className="text-gray-400 text-sm">
                        {isStandings 
                            ? (viewMode === "drivers" ? dict.standings.drivers : dict.standings.teams) 
                            : currentRace.Circuit.circuitName}
                    </p>
                    
                    <div className="hidden sm:block">
                        <Select
                            value={selectedSeason}
                            options={[{ value: "current", label: dict.results.currentSeason }, ...yearOptions]}
                            onChange={onSeasonChange}
                            ariaLabel={dict.results.selectSeason}
                        />
                    </div>
                </div>
            </div>
            
            {!isStandings && (
                <div className="hidden sm:flex justify-between sm:justify-center w-full sm:w-auto gap-3 mt-2 sm:mt-0">
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