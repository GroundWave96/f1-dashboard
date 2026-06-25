"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RaceResult } from "../../../types/f1";
import { nationalityToISO, getConstructorLogo } from "../../../lib/f1-utils";
import { useLanguage } from "../../../i18n/LanguageContext";

interface ResultsTableProps {
    results: RaceResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);
    const { dict } = useLanguage();
    const getPositionStyle = (pos: string) => {
        if (pos === "1") return "text-yellow-400 font-black drop-shadow-[0_0_8px_rgba(250,204,21,0.6)] text-base sm:text-lg";
        if (pos === "2") return "text-slate-300 font-black drop-shadow-[0_0_8px_rgba(203,213,225,0.5)] text-base sm:text-lg";
        if (pos === "3") return "text-amber-600 font-black drop-shadow-[0_0_8px_rgba(217,119,6,0.5)] text-base sm:text-lg";
        return "text-white font-bold";
    };
    const toggleRow = (driverId: string) => {
        setExpandedDriverId((prev) => (prev === driverId ? null : driverId));
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl h-full overflow-y-auto overscroll-contain">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="px-3 py-4 sm:px-6">{dict.results.pos}</th>
                        <th className="px-3 py-4 sm:px-6">{dict.results.driver}</th>
                        <th className="px-3 py-4 sm:px-6 hidden sm:table-cell">{dict.results.team}</th>
                        <th className="px-3 py-4 sm:px-6 text-center">{dict.results.pts}</th>
                        <th className="px-3 py-4 sm:px-6 text-center">{dict.results.timeStatus}</th>
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
                                    <td className="px-3 py-4 sm:px-6">
                                        <span className={getPositionStyle(row.position)}>{row.position}º</span>
                                    </td>

                                    <td className="px-3 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={getConstructorLogo(row.Constructor.constructorId)}
                                                alt={row.Constructor.name}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 object-contain aspect-square brightness-110 sm:hidden"
                                            />
                                            <img
                                                src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`}
                                                alt={row.Driver.nationality}
                                                className="hidden sm:block w-5 h-auto rounded-sm shadow-sm"
                                                loading="lazy"
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

                                    <td className="px-3 py-4 sm:px-6 hidden sm:table-cell text-gray-400">
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={getConstructorLogo(row.Constructor.constructorId)}
                                                alt={row.Constructor.name}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6 object-contain aspect-square brightness-110"
                                            />
                                            <span>{row.Constructor.name}</span>
                                        </div>
                                    </td>

                                    <td className="px-3 py-4 sm:px-6 text-center font-bold text-red-500">
                                        {Number(row.points) > 0 ? `+${row.points}` : row.status}
                                    </td>

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
                                                        <span className="text-gray-500 uppercase text-xs font-bold mb-1">{dict.results.start}</span>
                                                        <span className="font-mono text-gray-300 font-bold">P{row.grid}</span>
                                                        {(() => {
                                                            const grid = parseInt(row.grid);
                                                            const pos = parseInt(row.position);
                                                            if (grid === 0) return <span className="text-xs text-purple-400 mt-1">{dict.results.pitLane}</span>;
                                                            const diff = grid - pos;
                                                            if (diff > 0) return <span className="text-xs text-green-500 font-bold mt-1">+{diff} {dict.results.positions}</span>;
                                                            if (diff < 0) return <span className="text-xs text-red-500 font-bold mt-1">{diff} {dict.results.positions}</span>;
                                                            return <span className="text-xs text-gray-500 mt-1">{dict.results.keptPosition}</span>;
                                                        })()}
                                                    </div>

                                                    <div className="flex flex-col items-center">
                                                        <span className="text-gray-500 uppercase text-xs font-bold mb-1">{dict.results.totalTime}</span>
                                                        <span className="font-mono text-gray-300">
                                                            {row.status.includes("Lap") ? row.status : row.Time ? row.Time.time : row.status}
                                                        </span>
                                                        <span className="text-xs text-gray-500 mt-1">{row.laps} {dict.results.laps}</span>
                                                    </div>

                                                    {row.FastestLap && (
                                                        <div className="flex flex-col items-center text-center">
                                                            <span className="text-gray-500 uppercase text-xs font-bold mb-1">{dict.results.fastestLap}</span>
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
                                                                <span className="text-xs text-gray-500 mt-1">{dict.results.lap} {row.FastestLap.lap} • {row.FastestLap.AverageSpeed.speed} km/h</span>
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
    );
}