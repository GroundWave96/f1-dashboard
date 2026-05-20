"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { DriverStanding, ConstructorStanding, Driver } from "../../../types/f1";
import DriverTable from "./DriverTable";
import ConstructorTable from "./ConstructorTable";
import DriverModal from "./DriverModal";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";

export default function StandingsSection() {
    const [view, setView] = useState<"drivers" | "constructors">("drivers");
    const [drivers, setDrivers] = useState<DriverStanding[]>([]);
    const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, constructorName: string } | null>(null);
    const { dict } = useLanguage();
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        async function fetchData() {
            try {
                const [driversRes, constructorsRes] = await Promise.all([
                    api.get("current/driverStandings.json"),
                    api.get("current/constructorStandings.json")
                ]);

                setDrivers(driversRes.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []);
                setConstructors(constructorsRes.data.MRData.StandingsTable.StandingsLists[0]?.ConstructorStandings || []);
            } catch (error) {
                console.error("Erro ao buscar classificações:", error);
                setError(true);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <Spinner />
                <span>{dict.standings.loading}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center text-red-500 gap-2 h-full">
                <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
                <span className="text-zinc-500 text-xs text-center px-4">
                    {dict.errors.standingsMsg}
                </span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4 sm:gap-6 h-full py-4 sm:py-6">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="text-center sm:text-left">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">{dict.standings.title}</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">{dict.standings.season} {currentYear}</h2>
                </div>

                <div className="relative bg-zinc-900 p-1 rounded-full border border-zinc-800 flex items-center w-64 h-11">
                    <div
                        className={`absolute h-9 w-[calc(50%-4px)] bg-red-600 rounded-full shadow-lg shadow-red-900/20 transition-transform duration-300 ease-in-out z-0 ${view === "drivers" ? "translate-x-0" : "translate-x-full"
                            }`}
                    />

                    <button
                        onClick={() => setView("drivers")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "drivers" ? "text-white" : "text-gray-500"}`}
                    >
                        {dict.standings.drivers}
                    </button>
                    <button
                        onClick={() => setView("constructors")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "constructors" ? "text-white" : "text-gray-500"}`}
                    >
                        {dict.standings.teams}
                    </button>
                </div>
            </div>

            <div className="relative flex-1 min-h-0 w-full">
                {view === "drivers" ? (
                    <DriverTable
                        standings={drivers}
                        onRowClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
                    />
                ) : (
                    <ConstructorTable standings={constructors} />
                )}
            </div>

            {selectedDriver && (
                <DriverModal
                    driver={selectedDriver.driver}
                    constructorName={selectedDriver.constructorName}
                    onClose={() => setSelectedDriver(null)}
                />
            )}
        </div>
    );
}