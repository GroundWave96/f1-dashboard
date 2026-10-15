"use client";

import React from "react";
import Image from "next/image";
import { QualifyingResult } from "../../../types/f1";
import { getConstructorLogo, getPositionStyle, nationalityToISO } from "../../../lib/f1-utils";
import { parseLapTime } from "../../../lib/championship";
import { useLanguage } from "../../../i18n/LanguageContext";

interface QualifyingTableProps {
    results: QualifyingResult[];
}

const SEGMENTS = ["Q1", "Q2", "Q3"] as const;

export default function QualifyingTable({ results }: QualifyingTableProps) {
    const { dict } = useLanguage();

    const bestTime = (r: QualifyingResult) => r.Q3 || r.Q2 || r.Q1;
    const poleMs = parseLapTime(bestTime(results[0]));

    // Melhor tempo de cada fase, destacado em roxo como na transmissão oficial
    const fastestBySegment = Object.fromEntries(
        SEGMENTS.map((segment) => {
            const times = results.map((r) => parseLapTime(r[segment])).filter((t): t is number => t !== null);
            return [segment, times.length ? Math.min(...times) : null];
        })
    );

    const formatGap = (r: QualifyingResult) => {
        const ms = parseLapTime(bestTime(r));
        if (ms === null || poleMs === null) return "—";
        if (ms === poleMs) return "";
        return `+${((ms - poleMs) / 1000).toFixed(3)}`;
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl h-full overflow-y-auto overscroll-contain animate-in fade-in duration-300">
            <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-zinc-950 text-gray-400 uppercase sticky top-0 z-10 shadow-md">
                    <tr>
                        <th className="px-3 py-4 sm:px-6">{dict.results.pos}</th>
                        <th className="px-3 py-4 sm:px-6">{dict.results.driver}</th>
                        <th className="px-3 py-4 hidden md:table-cell">{dict.results.team}</th>
                        {SEGMENTS.map((segment) => (
                            <th key={segment} className="px-3 py-4 hidden sm:table-cell text-right">{segment}</th>
                        ))}
                        <th className="px-3 py-4 sm:hidden text-right">{dict.results.bestTime}</th>
                        <th className="px-3 py-4 sm:px-6 text-right">{dict.results.gap}</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((row) => (
                        <tr key={`${row.position}-${row.Driver.driverId}`} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors">
                            <td className="px-3 py-3.5 sm:px-6">
                                <span className={getPositionStyle(row.position)}>{row.position}º</span>
                            </td>
                            <td className="px-3 py-3.5 sm:px-6">
                                <div className="flex items-center gap-3">
                                    <Image
                                        src={getConstructorLogo(row.Constructor.constructorId)}
                                        alt={row.Constructor.name}
                                        width={24}
                                        height={24}
                                        className="w-6 h-6 object-contain aspect-square brightness-110 md:hidden"
                                    />
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://flagcdn.com/w40/${nationalityToISO(row.Driver.nationality)}.png`}
                                        alt={row.Driver.nationality}
                                        className="hidden md:block w-5 h-auto rounded-sm shadow-sm"
                                        loading="lazy"
                                    />
                                    <span className="text-sm whitespace-nowrap">
                                        <span className="hidden lg:inline">{row.Driver.givenName} </span>
                                        <span className="font-bold uppercase text-white">{row.Driver.familyName}</span>
                                    </span>
                                </div>
                            </td>
                            <td className="px-3 py-3.5 hidden md:table-cell text-gray-400">
                                <div className="flex items-center gap-2">
                                    <Image
                                        src={getConstructorLogo(row.Constructor.constructorId)}
                                        alt={row.Constructor.name}
                                        width={20}
                                        height={20}
                                        className="w-5 h-5 object-contain brightness-110"
                                    />
                                    <span className="truncate">{row.Constructor.name}</span>
                                </div>
                            </td>
                            {SEGMENTS.map((segment) => {
                                const isFastest = row[segment] && parseLapTime(row[segment]) === fastestBySegment[segment];
                                return (
                                    <td key={segment} className={`px-3 py-3.5 hidden sm:table-cell text-right font-mono text-xs ${isFastest ? "text-purple-400 font-bold" : row[segment] ? "text-zinc-300" : "text-zinc-700"}`}>
                                        {row[segment] || "—"}
                                    </td>
                                );
                            })}
                            <td className="px-3 py-3.5 sm:hidden text-right font-mono text-xs text-zinc-200">{bestTime(row) || "—"}</td>
                            <td className="px-3 py-3.5 sm:px-6 text-right font-mono text-xs text-zinc-500">{formatGap(row)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
