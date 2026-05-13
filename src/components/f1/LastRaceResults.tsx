"use client"; // 1. Avisamos ao Next.js que esse componente vai rodar no navegador e terá interatividade

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { PastRace } from "../../types/f1";

export default function LastRaceResults() {
  // 2. Criamos os "Estados" (memória do componente)
  const [races, setRaces] = useState<PastRace[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // 3. O useEffect faz a busca na API assim que a tela carrega
  useEffect(() => {
    async function fetchAllResults() {
      try {
        // limit=1000 é vital aqui! A API limita a 30 linhas por padrão. Como são 20 carros por corrida, precisamos de um limite alto para vir o ano todo.
        const response = await api.get("current/results.json?limit=1000");
        const allRaces: PastRace[] = response.data.MRData.RaceTable.Races;
        
        setRaces(allRaces);
        // Configura para começar mostrando a corrida mais recente (a última da lista)
        setCurrentIndex(allRaces.length - 1);
        setLoading(false);
      } catch (error) {
        console.error("Erro ao buscar resultados:", error);
        setLoading(false);
      }
    }

    fetchAllResults();
  }, []);

  // 4. Mostramos um aviso enquanto os dados não chegam
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
        <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        <p>Carregando histórico de corridas...</p>
      </div>
    );
  }

  // 5. Variáveis para facilitar a vida
  const currentRace = races[currentIndex];
  const results = currentRace.Results;
  
  // Verifica se existem corridas antes ou depois para desabilitar os botões
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < races.length - 1;

  // 6. Funções dos botões
  const goToPrevious = () => hasPrevious && setCurrentIndex(currentIndex - 1);
  const goToNext = () => hasNext && setCurrentIndex(currentIndex + 1);

  return (
    <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4">
      
      {/* Cabeçalho com Navegação */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md gap-4">
        {/* Botão Anterior */}
        <button 
          onClick={goToPrevious} 
          disabled={!hasPrevious}
          className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold w-full sm:w-auto"
        >
          &larr; Anterior
        </button>

        {/* Info da Corrida Atual */}
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">
            {currentRace.raceName}
          </h2>
          <p className="text-sm text-gray-400">Rodada {currentRace.round} • {currentRace.Circuit.circuitName}</p>
        </div>

        {/* Botão Próxima */}
        <button 
          onClick={goToNext} 
          disabled={!hasNext}
          className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold w-full sm:w-auto"
        >
          Próxima &rarr;
        </button>
      </div>

      {/* Tabela com o nosso fix do 'Lapped' intacto */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-[65vh] overflow-y-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
            <tr>
              <th className="px-4 py-4 sm:px-6">Pos</th>
              <th className="px-4 py-4 sm:px-6">Piloto</th>
              <th className="px-4 py-4 sm:px-6 hidden sm:table-cell">Equipe</th>
              <th className="px-4 py-4 sm:px-6 text-right">Tempo/Status</th>
              <th className="px-4 py-4 sm:px-6 text-right hidden sm:table-cell">Pts</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.Driver.driverId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <td className="px-4 py-4 sm:px-6 font-bold text-white">{row.position}º</td>
                <td className="px-4 py-4 sm:px-6">
                  <div className="flex flex-col">
                    <span>{row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span></span>
                    <span className="text-xs text-gray-500 sm:hidden mt-1">{row.Constructor.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 sm:px-6 hidden sm:table-cell">{row.Constructor.name}</td>
                
                {/* O Fix da volta continua aqui! */}
                <td className="px-4 py-4 sm:px-6 text-right font-mono text-xs sm:text-sm text-gray-400">
                  {row.status.includes("Lap") ? row.status : row.Time ? row.Time.time : row.status}
                </td>
                
                <td className="px-4 py-4 sm:px-6 font-bold text-red-500 text-right hidden sm:table-cell">
                  +{row.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}