import React from "react";
import { PastRace } from "../../../types/f1";

interface RaceNavigationProps {
    currentRace: PastRace;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
}

export default function RaceNavigation({ currentRace, hasPrevious, hasNext, onPrevious, onNext }: RaceNavigationProps) {
    const raceDateObj = new Date(`${currentRace.date}T${currentRace.time || "00:00:00Z"}`);
    const formattedDate = raceDateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            <div>
                <span className="text-red-500 font-bold uppercase tracking-widest text-xs mb-1 block">
                    Rodada {currentRace.round} • {formattedDate}
                </span>
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {currentRace.raceName}
                </h2>
                <p className="text-gray-400 text-sm">
                    {currentRace.Circuit.circuitName}
                </p>
            </div>

            <div className="flex justify-center w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                <button 
                    onClick={onPrevious} 
                    disabled={!hasPrevious}
                    className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                    &larr; Anterior
                </button>
                <button 
                    onClick={onNext} 
                    disabled={!hasNext}
                    className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                    Próxima &rarr;
                </button>
            </div>
        </div>
    );
}