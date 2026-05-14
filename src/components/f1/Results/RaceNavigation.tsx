import React from "react";
import { PastRace } from "../../../types/f1";

interface RaceNavigationProps {
    currentRace: PastRace;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    selectedSeason: string;
    onSeasonChange: (season: string) => void;
}

export default function RaceNavigation({ 
    currentRace, 
    hasPrevious, 
    hasNext, 
    onPrevious, 
    onNext,
    selectedSeason,
    onSeasonChange
}: RaceNavigationProps) {
    const raceDateObj = new Date(`${currentRace.date}T${currentRace.time || "00:00:00Z"}`);
    const formattedDate = raceDateObj.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    });

    // Gera uma lista de anos de 1950 até o ano atual
    const currentYear = new Date().getFullYear();
    const years = Array.from(new Array(currentYear - 1950 + 1), (val, index) => currentYear - index);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
            
            {/* LADO ESQUERDO: Título e Info da Corrida */}
            <div className="w-full sm:w-auto">
                <div className="flex justify-between items-center sm:items-start mb-1">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-xs">
                        Rodada {currentRace.round} • {formattedDate}
                    </span>
                    
                    {/* FILTRO DE TEMPORADA (Discreto, alinhado à direita no mobile) */}
                    <div className="sm:hidden relative">
                        <select 
                            value={selectedSeason}
                            onChange={(e) => onSeasonChange(e.target.value)}
                            className="appearance-none bg-zinc-800 text-white text-xs font-bold py-1 px-3 pr-6 rounded-full border border-zinc-700 outline-none focus:border-red-500 cursor-pointer"
                        >
                            <option value="current">Atual</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                        {/* Ícone de seta do select customizado */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                    {currentRace.raceName}
                </h2>
                
                <div className="flex items-center justify-between sm:justify-start gap-4">
                    <p className="text-gray-400 text-sm">
                        {currentRace.Circuit.circuitName}
                    </p>

                    {/* FILTRO DE TEMPORADA (Visível apenas no Desktop, fica do lado do nome da pista) */}
                    <div className="hidden sm:block relative">
                        <select 
                            value={selectedSeason}
                            onChange={(e) => onSeasonChange(e.target.value)}
                            className="appearance-none bg-zinc-800 text-white text-xs font-bold py-1 px-3 pr-6 rounded-full border border-zinc-700 outline-none focus:border-red-500 cursor-pointer transition-colors hover:bg-zinc-700"
                        >
                            <option value="current">Temporada Atual</option>
                            {years.map(year => (
                                <option key={year} value={year.toString()}>{year}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: Botões Anterior/Próxima */}
            <div className="flex justify-between sm:justify-center w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                <button 
                    onClick={onPrevious} 
                    disabled={!hasPrevious}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                    &larr; Anterior
                </button>
                <button 
                    onClick={onNext} 
                    disabled={!hasNext}
                    className="flex-1 sm:flex-none px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                >
                    Próxima &rarr;
                </button>
            </div>
        </div>
    );
}