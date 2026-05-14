"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PastRace } from "../../types/f1";
import { nationalityToISO, getConstructorLogo } from "../../lib/f1-utils";

export default function LastRaceResults() {
    const [races, setRaces] = useState<PastRace[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // NOVO ESTADO: Guarda o ID do piloto que está com a linha expandida
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchAllResults() {
            try {
                const response = await api.get("current/results.json?limit=1000");
                const allRaces: PastRace[] = response.data.MRData.RaceTable.Races;
                setRaces(allRaces);
                setCurrentIndex(allRaces.length - 1);
                setLoading(false);
            } catch (error) {
                console.error("Erro ao buscar resultados:", error);
                setLoading(false);
            }
        }
        fetchAllResults();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <p>Carregando histórico de corridas...</p>
            </div>
        );
    }

    const currentRace = races[currentIndex];
    const results = currentRace.Results;
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < races.length - 1;

    const goToPrevious = () => {
        if (hasPrevious) {
            setCurrentIndex(currentIndex - 1);
            setExpandedDriverId(null); // Fecha a linha ao trocar de corrida
        }
    };
    const goToNext = () => {
        if (hasNext) {
            setCurrentIndex(currentIndex + 1);
            setExpandedDriverId(null); // Fecha a linha ao trocar de corrida
        }
    };

    // Função que abre/fecha a aba do piloto
    const toggleRow = (driverId: string) => {
        setExpandedDriverId((prev) => (prev === driverId ? null : driverId));
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4">

            {/* Navegação */}
            {/* Cabeçalho com Navegação Ajustada para Mobile e Desktop */}
            <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md gap-4">

                {/* 1. Informações da Corrida - No mobile aparece primeiro (order-first) */}
                <div className="text-center order-first sm:order-none">
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
                        {currentRace.raceName}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Rodada {currentRace.round} • {currentRace.Circuit.circuitName}
                    </p>
                </div>

                {/* 2. Container de Botões - No mobile ficam lado a lado abaixo do título */}
                <div className="flex justify-center w-full sm:w-auto gap-3 mt-2 sm:mt-0">
                    <button
                        onClick={goToPrevious}
                        disabled={!hasPrevious}
                        className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                    >
                        &larr; Anterior
                    </button>

                    <button
                        onClick={goToNext}
                        disabled={!hasNext}
                        className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold text-sm"
                    >
                        Próxima &rarr;
                    </button>
                </div>
            </div>

            {/* Tabela */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-[65vh] overflow-y-auto">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                        <tr>
                            <th className="px-3 py-4 sm:px-6">Pos</th>
                            <th className="px-3 py-4 sm:px-6">Piloto</th>
                            <th className="px-3 py-4 sm:px-6 hidden sm:table-cell">Equipe</th>
                            {/* Pontos agora sempre visíveis (removido o hidden) */}
                            <th className="px-3 py-4 sm:px-6 text-center">Pts</th>
                            <th className="px-3 py-4 sm:px-6 text-center">Info</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((row) => {
                            const isExpanded = expandedDriverId === row.Driver.driverId;
                            const isPurpleLap = row.FastestLap?.rank === "1";

                            return (
                                <React.Fragment key={row.Driver.driverId}>
                                    <tr
                                        className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                                        onClick={() => toggleRow(row.Driver.driverId)}
                                    >
                                        {/* 1. POSIÇÃO */}
                                        <td className="px-3 py-4 sm:px-6 font-bold text-white">{row.position}º</td>

                                        {/* 2. PILOTO */}
                                        <td className="px-3 py-4 sm:px-6">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getConstructorLogo(row.Constructor.constructorId)}
                                                    alt={row.Constructor.name}
                                                    className="w-6 h-6 object-contain aspect-square brightness-110 sm:hidden"
                                                />
                                                <img
                                                    src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`}
                                                    alt={row.Driver.nationality}
                                                    className="hidden sm:block w-5 h-auto rounded-sm shadow-sm"
                                                />
                                                <div className="flex flex-col">
                                                    <span className="text-sm sm:text-base">
                                                        {row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
                                                    </span>
                                                    <span className="text-xs text-gray-500 sm:hidden tracking-wider">
                                                        {row.Constructor.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* 3. EQUIPE */}
                                        <td className="px-3 py-4 sm:px-6 hidden sm:table-cell text-gray-400">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={getConstructorLogo(row.Constructor.constructorId)}
                                                    alt={row.Constructor.name}
                                                    className="w-6 h-6 object-contain aspect-square brightness-110"
                                                />
                                                <span>{row.Constructor.name}</span>
                                            </div>
                                        </td>

                                        {/* 4. PONTOS */}
                                        <td className="px-3 py-4 sm:px-6 text-center font-bold text-red-500">
                                            {Number(row.points) > 0 ? `+${row.points}` : row.status}
                                        </td>

                                        {/* 5. SETA DE INFO */}
                                        <td className="px-3 py-4 sm:px-6 text-center">
                                            <div className={`transition-colors ${isPurpleLap ? "text-purple-500" : "text-gray-400"}`}>
                                                <svg
                                                    className={`w-5 h-5 mx-auto transform transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </td>
                                    </tr>

                                    {/* LINHA EXPANDIDA COM TRANSIÇÃO SUAVE (Sempre no DOM) */}
                                    <tr
                                        className={`bg-zinc-950/50 transition-all duration-300 ease-in-out ${isExpanded ? "border-b border-zinc-800 opacity-100" : "opacity-0 invisible"
                                            }`}
                                    >
                                        <td colSpan={5} className="p-0">
                                            <div className={`grid transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] py-4 sm:py-6" : "grid-rows-[0fr]"
                                                }`}>
                                                <div className="overflow-hidden">
                                                    <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center items-center text-sm px-4 sm:px-6">

                                                        <div className="flex flex-col items-center">
                                                            <span className="text-gray-500 uppercase text-xs font-bold mb-1">Largada</span>
                                                            <span className="font-mono text-gray-300 font-bold">P{row.grid}</span>
                                                            {(() => {
                                                                const grid = parseInt(row.grid);
                                                                const pos = parseInt(row.position);
                                                                if (grid === 0) return <span className="text-xs text-purple-400 mt-1">Pit Lane</span>;
                                                                const diff = grid - pos;
                                                                if (diff > 0) return <span className="text-xs text-green-500 font-bold mt-1">+{diff} posições</span>;
                                                                if (diff < 0) return <span className="text-xs text-red-500 font-bold mt-1">{diff} posições</span>;
                                                                return <span className="text-xs text-gray-500 mt-1">Manteve posição</span>;
                                                            })()}
                                                        </div>

                                                        <div className="flex flex-col items-center">
                                                            <span className="text-gray-500 uppercase text-xs font-bold mb-1">Tempo Total / Gap</span>
                                                            <span className="font-mono text-gray-300">
                                                                {row.status.includes("Lap") ? row.status : row.Time ? row.Time.time : row.status}
                                                            </span>
                                                            <span className="text-xs text-gray-500 mt-1">{row.laps} Voltas</span>
                                                        </div>

                                                        {row.FastestLap && (
                                                            <div className="flex flex-col items-center text-center">
                                                                <span className="text-gray-500 uppercase text-xs font-bold mb-1">Melhor Volta</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`font-mono font-bold ${isPurpleLap ? "text-purple-400" : "text-white"}`}>
                                                                        {row.FastestLap.Time.time}
                                                                    </span>
                                                                    {isPurpleLap && (
                                                                        <svg className="w-4 h-4 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    )}
                                                                </div>
                                                                {row.FastestLap.AverageSpeed && (
                                                                    <span className="text-xs text-gray-500 mt-1">Volta {row.FastestLap.lap} • {row.FastestLap.AverageSpeed.speed} km/h</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}