"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RaceResult } from "../../../types/f1";
import { nationalityToISO, getConstructorLogo, getPositionStyle, getResultOutcome, OUTCOME_LABEL, translateStatus } from "../../../lib/f1-utils";
import { clickableProps } from "../../../lib/hooks";
import { useLanguage } from "../../../i18n/LanguageContext";

interface ResultsTableProps {
    results: RaceResult[];
}

export default function ResultsTable({ results }: ResultsTableProps) {
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const { dict, lang } = useLanguage();
    const leaderLaps = Number(results[0]?.laps ?? 0);
    const toggleRow = (rowId: string) => {
        setExpandedRowId((prev) => (prev === rowId ? null : rowId));
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
                        // Nos anos 50 o mesmo piloto podia aparecer mais de uma vez na corrida (carro compartilhado)
                        const rowId = `${row.position}-${row.Driver.driverId}`;
                        const isExpanded = expandedRowId === rowId;
                        const isPurpleLap = row.FastestLap?.rank === "1";
                        const outcome = getResultOutcome(row);
                        const statusText = translateStatus(row.status, lang, leaderLaps - Number(row.laps));

                        return (
                            <React.Fragment key={rowId}>
                                <tr
                                    className="border-b border-zinc-800 hover:bg-zinc-800/50 focus-visible:bg-zinc-800/50 outline-none transition-colors cursor-pointer"
                                    {...clickableProps(() => toggleRow(rowId))}
                                    aria-expanded={isExpanded}
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
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
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

                                    <td className="px-3 py-4 sm:px-6 text-center">
                                        {Number(row.points) > 0 ? (
                                            <span className="font-bold text-red-500">+{row.points}</span>
                                        ) : outcome === "classified" ? (
                                            <span className="font-mono text-zinc-600">0</span>
                                        ) : (
                                            <span
                                                className="inline-block text-[10px] font-black tracking-wider text-red-400 bg-red-500/10 border border-red-500/25 rounded px-1.5 py-0.5"
                                                title={statusText}
                                            >
                                                {OUTCOME_LABEL[outcome]}
                                            </span>
                                        )}
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
                                                            {row.Time ? row.Time.time : statusText}
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