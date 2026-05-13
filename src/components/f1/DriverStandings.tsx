import { api } from "../../lib/api";
import { DriverStanding } from "../../types/f1";

export default async function DriverStandings() {
  const response = await api.get("current/driverStandings.json");
  
  const standings: DriverStanding[] = response.data.MRData.StandingsTable.StandingsLists[0].DriverStandings;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
        
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-zinc-950 text-gray-400 uppercase">
            <tr>
              <th className="px-6 py-4">Pos</th>
              <th className="px-6 py-4">Piloto</th>
              <th className="px-6 py-4">Equipe</th>
              <th className="px-6 py-4 text-right">Pontos</th>
            </tr>
          </thead>
          
          <tbody>
            {standings.map((row) => (
              <tr key={row.Driver.driverId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                <td className="px-6 py-4 font-bold text-white">{row.position}º</td>
                <td className="px-6 py-4">
                  {row.Driver.givenName} <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
                </td>
                <td className="px-6 py-4">{row.Constructors[0]?.name}</td>
                <td className="px-6 py-4 font-bold text-red-500 text-right">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}