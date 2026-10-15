"use client";

import React, { useState } from "react";
import { apiGet, apiGetAllRaces } from "../../../lib/api";
import { useAsyncData } from "../../../lib/hooks";
import { Driver, Constructor } from "../../../types/f1";
import RaceNavigation from "./RaceNavigation";
import ResultsTable from "./ResultsTable";
import QualifyingTable from "./QualifyingTable";
import Footer from "../../layout/Footer";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";
import DriverTable from "../Standings/DriverTable";
import ConstructorTable from "../Standings/ConstructorTable";
import DriverModal from "../Standings/DriverModal";
import ConstructorModal from "../Standings/ConstructorModal";

type ViewMode = "races" | "drivers" | "constructors";
type SessionTab = "race" | "sprint" | "qualifying";

async function loadSeasonData(season: string) {
    const [races, drivers, constructors] = await Promise.all([
        apiGetAllRaces(season, "results"),
        apiGet(`${season}/driverStandings.json?limit=100`),
        apiGet(`${season}/constructorStandings.json?limit=100`),
    ]);
    return {
        races,
        standings: drivers.StandingsTable?.StandingsLists[0]?.DriverStandings ?? [],
        constructorStandings: constructors.StandingsTable?.StandingsLists[0]?.ConstructorStandings ?? [],
    };
}

// Corridas sprint existem desde 2021
const seasonHasSprints = (season: string) => season === "current" || Number(season) >= 2021;

export default function LastRacesSection() {
    const [season, setSeason] = useState<string>("current");
    const [viewMode, setViewMode] = useState<ViewMode>("races");
    const [sessionTab, setSessionTab] = useState<SessionTab>("race");
    const [selected, setSelected] = useState<{ season: string; index: number } | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, constructorName: string } | null>(null);
    const [selectedConstructor, setSelectedConstructor] = useState<Constructor | null>(null);

    const { dict } = useLanguage();

    const seasonData = useAsyncData(`results:${season}`, () => loadSeasonData(season));
    const sprints = useAsyncData(seasonHasSprints(season) ? `sprints:${season}` : null, () => apiGetAllRaces(season, "sprint"));
    const qualifying = useAsyncData(
        viewMode === "races" && sessionTab === "qualifying" ? `quali:${season}` : null,
        () => apiGetAllRaces(season, "qualifying")
    );

    const handleSeasonChange = (newSeason: string) => {
        setSeason(newSeason);
        setViewMode("races");
    };

    if (seasonData.loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <Spinner />
                <span>{dict.results.loading}{season === "current" ? "" : ` ${season}`}...</span>
            </div>
        );
    }

    if (seasonData.error || !seasonData.data) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
                <ErrorIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
                <span className="text-zinc-500 text-xs text-center px-4 mb-4">
                    {dict.errors.resultsMsg}
                </span>
                <button
                    onClick={seasonData.reload}
                    className="px-4 py-2 bg-zinc-800 text-white rounded hover:bg-zinc-700 font-bold text-sm transition-colors"
                >
                    {dict.errors.tryAgain}
                </button>
            </div>
        );
    }

    const { races, standings, constructorStandings } = seasonData.data;

    if (races.length === 0) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-4">
                <span>{dict.results.noRaces}</span>
                {season === "current" ? (
                    <button onClick={() => handleSeasonChange(String(new Date().getFullYear() - 1))} className="text-red-500 underline">{dict.results.previousSeason}</button>
                ) : (
                    <button onClick={() => handleSeasonChange("current")} className="text-red-500 underline">{dict.results.backToCurrent}</button>
                )}
            </div>
        );
    }

    // Ao trocar de temporada, abre na última corrida
    const currentIndex = selected?.season === season && selected.index < races.length ? selected.index : races.length - 1;
    const currentRace = races[currentIndex];
    const hasPrevious = currentIndex > 0;
    const hasNext = currentIndex < races.length - 1;
    const goTo = (index: number) => setSelected({ season, index });

    const sprintRace = sprints.data?.find((race) => race.round === currentRace.round);
    const qualiRace = qualifying.data?.find((race) => race.round === currentRace.round);
    const availableTabs: SessionTab[] = sprintRace ? ["race", "sprint", "qualifying"] : ["race", "qualifying"];
    const activeTab: SessionTab = availableTabs.includes(sessionTab) ? sessionTab : "race";
    const tabLabels: Record<SessionTab, string> = {
        race: dict.results.raceSession,
        sprint: dict.results.sprintSession,
        qualifying: dict.results.qualiSession,
    };

    const renderSession = () => {
        if (activeTab === "sprint" && sprintRace) {
            return <ResultsTable key={`${season}-${currentRace.round}-sprint`} results={sprintRace.SprintResults ?? []} />;
        }
        if (activeTab === "qualifying") {
            if (qualifying.loading) {
                return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                );
            }
            if (!qualiRace?.QualifyingResults?.length) {
                return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg h-full flex items-center justify-center text-sm text-zinc-500 px-4 text-center">
                        {dict.results.noQuali}
                    </div>
                );
            }
            return <QualifyingTable results={qualiRace.QualifyingResults} />;
        }
        return <ResultsTable key={`${season}-${currentRace.round}-race`} results={currentRace.Results ?? []} />;
    };

    const viewTabs: { mode: ViewMode; label: string }[] = [
        { mode: "races", label: dict.results.racesTab },
        { mode: "drivers", label: dict.standings.drivers },
        { mode: "constructors", label: dict.standings.teams },
    ];

    const navButtonClass = (enabled: boolean) =>
        `flex-1 px-4 py-2 rounded transition-all font-bold text-sm ${enabled
            ? "bg-zinc-800 text-white hover:bg-zinc-700 active:bg-zinc-600"
            : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
        }`;

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col h-full py-4 sm:py-6">
            <div className="shrink-0">
                <RaceNavigation
                    currentRace={currentRace}
                    hasPrevious={hasPrevious}
                    hasNext={hasNext}
                    onPrevious={() => hasPrevious && goTo(currentIndex - 1)}
                    onNext={() => hasNext && goTo(currentIndex + 1)}
                    selectedSeason={season}
                    onSeasonChange={handleSeasonChange}
                    viewMode={viewMode}
                />
            </div>

            <div className="flex justify-center mb-4 px-2 shrink-0">
                <div className="bg-zinc-900 p-1 rounded-full border border-zinc-800 w-full max-w-sm h-11">
                    <div className="relative flex items-center w-full h-full">
                        <div
                            className="absolute top-0 bottom-0 left-0 w-1/3 bg-zinc-700 rounded-full shadow-lg transition-transform duration-300 ease-in-out z-0"
                            style={{ transform: `translateX(${viewTabs.findIndex((t) => t.mode === viewMode) * 100}%)` }}
                        />
                        {viewTabs.map((tab) => (
                            <button
                                key={tab.mode}
                                type="button"
                                onClick={() => setViewMode(tab.mode)}
                                aria-pressed={viewMode === tab.mode}
                                className={`relative z-10 h-full flex-1 flex items-center justify-center text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${viewMode === tab.mode ? "text-white" : "text-gray-500"}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {viewMode === "races" && (
                <>
                    <div className="flex sm:hidden justify-between w-full max-w-sm mx-auto gap-3 px-2 mb-3 shrink-0">
                        <button onClick={() => hasPrevious && goTo(currentIndex - 1)} disabled={!hasPrevious} className={navButtonClass(hasPrevious)}>
                            &larr; {dict.results.previous}
                        </button>
                        <button onClick={() => hasNext && goTo(currentIndex + 1)} disabled={!hasNext} className={navButtonClass(hasNext)}>
                            {dict.results.next} &rarr;
                        </button>
                    </div>

                    <div className="flex items-center gap-5 px-1 mb-3 border-b border-zinc-800/80 shrink-0" role="tablist" aria-label={dict.results.sessionData}>
                        {availableTabs.map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                role="tab"
                                aria-selected={activeTab === tab}
                                onClick={() => setSessionTab(tab)}
                                className={`relative pb-2 text-[11px] font-bold uppercase tracking-wider transition-colors ${activeTab === tab ? "text-white" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                {tabLabels[tab]}
                                {activeTab === tab && <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-red-500 rounded-full" />}
                            </button>
                        ))}
                    </div>
                </>
            )}

            <div className="relative flex-1 min-h-0 w-full mb-3 sm:mb-4">
                {viewMode === "races" && renderSession()}
                {viewMode === "drivers" && (
                    <DriverTable
                        standings={standings}
                        onRowClick={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
                    />
                )}
                {viewMode === "constructors" && <ConstructorTable onRowClick={setSelectedConstructor} standings={constructorStandings} />}
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
                    season={season}
                    onClose={() => setSelectedConstructor(null)}
                />
            )}
            <Footer />
        </div>
    );
}
