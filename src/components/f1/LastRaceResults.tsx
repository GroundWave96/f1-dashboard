import { api } from "../../lib/api";
import { PastRace } from "../../types/f1";

export default async function LastRaceResults() {
  const response = await api.get("current/last/results.json");
  
  const race: PastRace = response.data.MRData.RaceTable.Races[0];
  const results = race.Results;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
          Resultados: {race.raceName}
        </h2>
        <p className="text-gray-400">Circuito: {race.Circuit.circuitName}</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-[70vh] overflow-y-auto">
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
                
                {/* Tempo ou Status (ex: +1 Lap, Finished) */}
                <td className="px-4 py-4 sm:px-6 text-right font-mono text-xs sm:text-sm text-gray-400">
                {row.status.includes("Lap") 
                    ? row.status 
                    : row.Time ? row.Time.time : row.status}
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