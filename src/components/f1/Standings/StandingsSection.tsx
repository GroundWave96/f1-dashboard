"use client";

import React, { useState } from "react";
import { apiGet } from "../../../lib/api";
import { useAsyncData } from "../../../lib/hooks";
import { Driver, Constructor } from "../../../types/f1";
import { ConstructorStandingsList, DriverStandingsList } from "./StandingsList";
import DriverModal from "./DriverModal";
import ConstructorModal from "./ConstructorModal";
import PointsChart from "./PointsChart";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";
import SectionHeader from "../../ui/SectionHeader";
import SegmentedControl from "../../ui/SegmentedControl";

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
                <span className="text-muted text-xs text-center px-4 mb-2">
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
        <div className="shell h-full flex flex-col gap-4 sm:gap-6 py-4 sm:py-6">
            <SectionHeader
                eyebrow={dict.standings.title}
                title={`${dict.standings.season} ${data.season}`}
                actions={
                    <SegmentedControl
                        variant="primary"
                        className="w-full max-w-80 sm:w-80"
                        value={view}
                        onChange={setView}
                        options={VIEWS.map((option) => ({ value: option, label: labels[option] }))}
                    />
                }
            />

            <div key={view} className="reveal swap-in relative flex-1 min-h-0 w-full" style={{ "--i": 1 } as React.CSSProperties}>
                {view === "drivers" && (
                    <DriverStandingsList
                        standings={data.drivers}
                        onSelect={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
                    />
                )}
                {view === "constructors" && (
                    <ConstructorStandingsList onSelect={setSelectedConstructor} standings={data.constructors} drivers={data.drivers} />
                )}
                {view === "evolution" && <PointsChart />}
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
