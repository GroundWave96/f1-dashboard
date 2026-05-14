"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PastRace } from "../../types/f1";

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
      <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md gap-4">
        <button onClick={goToPrevious} disabled={!hasPrevious} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold w-full sm:w-auto">
          &larr; Anterior
        </button>
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">{currentRace.raceName}</h2>
          <p className="text-sm text-gray-400">Rodada {currentRace.round} • {currentRace.Circuit.circuitName}</p>
        </div>
        <button onClick={goToNext} disabled={!hasNext} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold w-full sm:w-auto">
          Próxima &rarr;
        </button>
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
              const isPurpleLap = row.FastestLap?.rank === "1"; // Checa se é a volta roxa da corrida

              return (
                // Usamos React.Fragment porque agora retornamos 2 TRs para cada piloto (A linha principal e a aba expandida)
                <React.Fragment key={row.Driver.driverId}>
                  <tr 
                    onClick={() => toggleRow(row.Driver.driverId)}
                    className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-4 sm:px-6 font-bold text-white">{row.position}º</td>
                    <td className="px-3 py-4 sm:px-6">
                      <div className="flex flex-col">
                        <span>{row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span></span>
                        <span className="text-xs text-gray-500 sm:hidden mt-1">{row.Constructor.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-4 sm:px-6 hidden sm:table-cell">{row.Constructor.name}</td>
                    
                    {/* Pontos visíveis no mobile (centralizados e fonte um pouco menor no mobile) */}
                    <td className="px-3 py-4 sm:px-6 font-bold text-red-500 text-center text-xs sm:text-sm">
                      +{row.points}
                    </td>

                    {/* Botão de Expandir com a Dica Visual da Volta Roxa */}
                    <td className="px-3 py-4 sm:px-6 text-center">
                      <button 
                        className={`transition-colors ${
                          isPurpleLap 
                            ? "text-purple-500 hover:text-purple-400" 
                            : "text-gray-400 hover:text-white"
                        }`}
                        title={isPurpleLap ? "Volta mais rápida da corrida" : "Ver detalhes"}
                      >
                        <svg className={`w-5 h-5 mx-auto transform transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* LINHA EXPANDIDA COM OS DETALHES DE TEMPO E LARGADA */}
                  {isExpanded && (
                    <tr className="bg-zinc-950/50 border-b border-zinc-800">
                      <td colSpan={5} className="px-4 py-4 sm:px-6">
                        <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 justify-center items-center text-sm">
                          
                          {/* Largada e Posições Ganhas/Perdidas */}
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

                          {/* Tempo Total / Status */}
                          <div className="flex flex-col items-center">
                            <span className="text-gray-500 uppercase text-xs font-bold mb-1">Tempo Total / Gap</span>
                            <span className="font-mono text-gray-300">
                              {row.status.includes("Lap") ? row.status : row.Time ? row.Time.time : row.status}
                            </span>
                            <span className="text-xs text-gray-500 mt-1">{row.laps} Voltas</span>
                          </div>

                          {/* Melhor Volta */}
                          {row.FastestLap && (
                            <div className="flex flex-col items-center">
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
                              {/* Renderização Condicional: Só mostra a linha de baixo se tiver velocidade */}
                              {row.FastestLap.AverageSpeed && (
                                <span className="text-xs text-gray-500 mt-1">Volta {row.FastestLap.lap} • {row.FastestLap.AverageSpeed.speed} km/h</span>
                              )}
                              {!row.FastestLap.AverageSpeed && (
                                <span className="text-xs text-gray-500 mt-1">Feita na volta {row.FastestLap.lap}</span>
                              )}
                            </div>
                          )}

                          {!row.FastestLap && (
                            <div className="flex flex-col items-center">
                              <span className="text-gray-500 uppercase text-xs font-bold mb-1">Melhor Volta</span>
                              <span className="text-gray-600 italic">Sem registro</span>
                            </div>
                          )}

                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}