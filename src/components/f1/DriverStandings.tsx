import { api } from "../../lib/api";
import { DriverStanding } from "../../types/f1";
import { nationalityToISO, getConstructorLogo } from "../../lib/f1-utils";

export default async function DriverStandings() {
    const response = await api.get("current/driverStandings.json");
    const standings: DriverStanding[] = response.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

    return (
        <div className="w-full max-w-4xl mx-auto px-2">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl max-h-[80dvh] overflow-y-auto overscroll-contain">
                <table className="w-full text-left text-sm text-gray-300">
                    <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                        <tr>
                            <th className="px-4 py-4 sm:px-6">Pos</th>
                            <th className="px-4 py-4 sm:px-6">Piloto</th>
                            <th className="px-4 py-4 sm:px-6 hidden sm:table-cell">Equipe</th>
                            <th className="px-4 py-4 sm:px-6 text-right">Pts</th>
                        </tr>
                    </thead>
                    <tbody>
                        {standings.map((row) => (
                            <tr key={row.Driver.driverId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                                {/* 1. POSIÇÃO */}
                                <td className="px-4 py-4 sm:px-6 font-bold text-white">{row.position}º</td>
                                
                                {/* 2. PILOTO */}
                                <td className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getConstructorLogo(row.Constructors[0]?.constructorId)}
                                            alt={row.Constructors[0]?.name}
                                            className="w-7 h-7 object-contain aspect-square brightness-110 sm:hidden"
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
                                            <span className="text-[11px] text-gray-400 sm:hidden">
                                                {row.Constructors[0]?.name}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                
                                <td className="px-4 py-4 sm:px-6 hidden sm:table-cell">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={getConstructorLogo(row.Constructors[0]?.constructorId)}
                                            alt={row.Constructors[0]?.name}
                                            className="w-8 h-8 object-contain aspect-square brightness-110"
                                        />
                                        <span>{row.Constructors[0]?.name}</span>
                                    </div>
                                </td>
                                
                                <td className="px-4 py-4 sm:px-6 font-bold text-red-500 text-right">{row.points}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}