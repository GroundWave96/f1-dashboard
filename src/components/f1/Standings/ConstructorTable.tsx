import React from "react";
import Image from "next/image";
import { ConstructorStanding } from "../../../types/f1";
import { getConstructorLogo, translateNationality } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface ConstructorTableProps {
    standings: ConstructorStanding[];
}

export default function ConstructorTable({ standings }: ConstructorTableProps) {
    const { dict, lang } = useLanguage();

    const getPositionStyle = (pos: string) => {
        if (pos === "1") return "text-yellow-400 font-black drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] text-base sm:text-lg";
        if (pos === "2") return "text-slate-300 font-black drop-shadow-[0_0_8px_rgba(203,213,225,0.5)] text-base sm:text-lg";
        if (pos === "3") return "text-amber-600 font-black drop-shadow-[0_0_8px_rgba(217,119,6,0.5)] text-base sm:text-lg";
        return "text-white font-bold";
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl h-fit max-h-full w-full overflow-y-auto overscroll-contain animate-in fade-in duration-500">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="px-4 py-4 sm:px-6">{dict.standings.pos}</th>
                        <th className="px-4 py-4 sm:px-6">{dict.standings.team}</th>
                        <th className="px-4 py-4 sm:px-6 hidden sm:table-cell">{dict.standings.wins}</th>
                        <th className="px-4 py-4 sm:px-6 text-right">{dict.standings.pts}</th>
                    </tr>
                </thead>
                <tbody>
                    {standings.map((row) => (
                        <tr key={row.Constructor.constructorId} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                            <td className="px-4 py-4 sm:px-6">
                                <span className={getPositionStyle(row.position)}>{row.position}º</span>
                            </td>
                            <td className="px-4 py-4 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={getConstructorLogo(row.Constructor.constructorId)}
                                        alt={row.Constructor.name}
                                        width={32}
                                        height={32}
                                        className="w-8 h-8 object-contain aspect-square brightness-110"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm sm:text-base font-bold text-white">
                                            {row.Constructor.name}
                                        </span>
                                        <span className="text-[11px] text-gray-400">
                                            {translateNationality(row.Constructor.nationality, lang as 'pt' | 'en')}
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