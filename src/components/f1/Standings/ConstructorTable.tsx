import React from "react";
import { ConstructorStanding } from "../../../types/f1";
import { getConstructorLogo } from "../../../lib/f1-utils";

interface ConstructorTableProps {
    standings: ConstructorStanding[];
}

export default function ConstructorTable({ standings }: ConstructorTableProps) {
    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl h-fit max-h-full w-full overflow-y-auto overscroll-contain animate-in fade-in duration-500">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="px-4 py-4 sm:px-6">Pos</th>
                        <th className="px-4 py-4 sm:px-6">Equipe</th>
                        <th className="px-4 py-4 sm:px-6 hidden sm:table-cell">Vitórias</th>
                        <th className="px-4 py-4 sm:px-6 text-right">Pts</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((row) => (
                        <tr key={row.Constructor.constructorId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-4 sm:px-6 font-bold text-white">{row.position}º</td>
                            <td className="px-4 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={getConstructorLogo(row.Constructor.constructorId)}
                                        alt={row.Constructor.name}
                                        className="w-8 h-8 object-contain aspect-square brightness-110"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm sm:text-base font-bold text-white">
                                            {row.Constructor.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400 sm:hidden">
                                            {row.Constructor.nationality}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-4 sm:px-6 hidden sm:table-cell text-zinc-400">{row.wins}</td>
                            <td className="px-4 py-4 sm:px-6 font-bold text-red-500 text-right">{row.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}