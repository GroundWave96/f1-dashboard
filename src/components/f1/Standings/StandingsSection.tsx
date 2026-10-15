"use client";

import React, { useState } from "react";
import { apiGet } from "../../../lib/api";
import { useAsyncData } from "../../../lib/hooks";
import { Driver, Constructor } from "../../../types/f1";
import DriverTable from "./DriverTable";
import ConstructorTable from "./ConstructorTable";
import DriverModal from "./DriverModal";
import ConstructorModal from "./ConstructorModal";
import PointsChart from "./PointsChart";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";

type View = "drivers" | "constructors" | "evolution";
const VIEWS: View[] = ["drivers", "constructors", "evolution"];

async function loadStandings() {
    const [drivers, constructors] = await Promise.all([
        apiGet("current/driverStandings.json?limit=100"),
        apiGet("current/constructorStandings.json?limit=100"),
    ]);
    return {
        season: drivers.StandingsTable?.season ?? String(new Date().getFullYear()),
        drivers: drivers.StandingsTable?.StandingsLists[0]?.DriverStandings ?? [],
        constructors: constructors.StandingsTable?.StandingsLists[0]?.ConstructorStandings ?? [],
    };
}

export default function StandingsSection() {
    const [view, setView] = useState<View>("drivers");
    const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, constructorName: string } | null>(null);
    const [selectedConstructor, setSelectedConstructor] = useState<Constructor | null>(null);
    const { dict } = useLanguage();
    const { data, loading, error, reload } = useAsyncData("standings:current", loadStandings);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4 h-full">
                <Spinner />
                <span>{dict.standings.loading}</span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center text-red-500 gap-2 h-full">
                <ErrorIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
                <span className="text-zinc-500 text-xs text-center px-4 mb-2">
                    {dict.errors.standingsMsg}
                </span>
                <button onClick={reload} className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors">
                    {dict.errors.tryAgain}
                </button>
            </div>
        );
    }

    const labels: Record<View, string> = {
        drivers: dict.standings.drivers,
        constructors: dict.standings.teams,
        evolution: dict.standings.evolution,
    };

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4 sm:gap-6 h-full py-4 sm:py-6">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="text-center sm:text-left">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.standings.title}</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">{dict.standings.season} {data.season}</h2>
                </div>

                <div className="relative bg-zinc-900 p-1 rounded-full border border-zinc-800 flex items-center w-full max-w-80 sm:w-80 h-11">
                    <div
                        className="absolute h-9 w-[calc((100%-8px)/3)] bg-red-600 rounded-full shadow-lg shadow-red-900/20 transition-transform duration-300 ease-in-out z-0"
                        style={{ transform: `translateX(${VIEWS.indexOf(view) * 100}%)` }}
                    />

                    {VIEWS.map((option) => (
                        <button
                            key={option}
                            type="button"
                            onClick={() => setView(option)}
                            aria-pressed={view === option}
                            className={`relative z-10 h-full flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === option ? "text-white" : "text-gray-500"}`}
                        >
                            {labels[option]}
                        </button>
                    ))}
                </div>
            </div>

            <div className="relative flex-1 min-h-0 w-full">
                {view === "drivers" && (
                    <DriverTable
                        standings={data.drivers}
                        onRowClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
                    />
                )}
                {view === "constructors" && (
                    <ConstructorTable onRowClick={setSelectedConstructor} standings={data.constructors} />
                )}
                {view === "evolution" && (
                    <div className="h-full overflow-y-auto overscroll-contain custom-scrollbar">
                        <PointsChart />
                    </div>
                )}
            </div>

            {selectedDriver && (
                <DriverModal
                    driver={selectedDriver.driver}
                    constructorName={selectedDriver.constructorName}
                    onClose={() => setSelectedDriver(null)}
                />
            )}
            {selectedConstructor && (
                <ConstructorModal
                    constructorData={selectedConstructor}
                    season="current"
                    onClose={() => setSelectedConstructor(null)}
                />
            )}
        </div>
    );
}
