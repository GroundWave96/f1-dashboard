"use client";

import React, { useState } from "react";
import { apiGet, apiGetAllRaces } from "../../../lib/api";
import { useAsyncData } from "../../../lib/hooks";
import { Driver, Constructor } from "../../../types/f1";
import RaceNavigation, { ViewMode } from "./RaceNavigation";
import ResultsList from "./ResultsList";
import QualifyingList from "./QualifyingList";
import Footer from "../../layout/Footer";
import { useLanguage } from "../../../i18n/LanguageContext";
import Spinner from "../../ui/Spinner";
import { ErrorIcon } from "../../ui/icons";
import { ConstructorStandingsList, DriverStandingsList } from "../Standings/StandingsList";
import DriverModal from "../Standings/DriverModal";
import ConstructorModal from "../Standings/ConstructorModal";

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
                <span>{dict.results.loading}{season === "current" ? "" : ` ${season}`}…</span>
            </div>
        );
    }

    if (seasonData.error || !seasonData.data) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center text-red-500 gap-2">
                <ErrorIcon className="w-12 h-12 mb-2 opacity-50" />
                <span className="font-bold uppercase tracking-wider text-sm">{dict.errors.connectionTitle}</span>
                <span className="text-muted text-xs text-center px-4 mb-4">
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
            return <ResultsList results={sprintRace.SprintResults ?? []} raceName={`${currentRace.raceName} — ${dict.results.sprintSession}`} />;
        }
        if (activeTab === "qualifying") {
            if (qualifying.loading) {
                return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-full flex items-center justify-center">
                        <Spinner />
                    </div>
                );
            }
            if (!qualiRace?.QualifyingResults?.length) {
                return (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-full flex items-center justify-center text-sm text-muted px-4 text-center">
                        {dict.results.noQuali}
                    </div>
                );
            }
            return <QualifyingList results={qualiRace.QualifyingResults} />;
        }
        return <ResultsList results={currentRace.Results ?? []} raceName={currentRace.raceName} />;
    };

    const sessionTabs = (
        <div className="flex items-center gap-5 px-1" role="group" aria-label={dict.results.sessionData}>
            {availableTabs.map((tab) => (
                <button
                    key={tab}
                    type="button"
                    aria-pressed={activeTab === tab}
                    onClick={() => setSessionTab(tab)}
                    className={`relative pb-2.5 text-[11px] font-bold uppercase tracking-wider transition-colors duration-150 ${activeTab === tab ? "text-white" : "text-muted hover:text-zinc-300"}`}
                >
                    {tabLabels[tab]}
                    <span className={`absolute left-0 right-0 -bottom-px h-0.5 rounded-full bg-red-500 transition-transform duration-300 ease-fluid origin-center ${activeTab === tab ? "scale-x-100" : "scale-x-0"}`} />
                </button>
            ))}
        </div>
    );

    // A chave muda a cada troca de corrida/aba, o que dispara a transição rápida (.swap-in)
    const contentKey = `${viewMode}-${season}-${currentRace.round}-${activeTab}`;

    return (
        <div className="shell h-full flex flex-col gap-3 sm:gap-4 pt-4 sm:pt-6 pb-1">
            <RaceNavigation
                currentRace={currentRace}
                viewMode={viewMode}
                onViewChange={setViewMode}
                selectedSeason={season}
                onSeasonChange={handleSeasonChange}
                hasPrevious={hasPrevious}
                hasNext={hasNext}
                onPrevious={() => hasPrevious && goTo(currentIndex - 1)}
                onNext={() => hasNext && goTo(currentIndex + 1)}
                sessionTabs={sessionTabs}
            />

            <div key={contentKey} className="reveal swap-in relative flex-1 min-h-0 w-full" style={{ "--i": 1 } as React.CSSProperties}>
                {viewMode === "races" && renderSession()}
                {viewMode === "drivers" && (
                    <DriverStandingsList
                        standings={standings}
                        onSelect={(driver, constructorName) => setSelectedDriver({ driver, constructorName })}
                    />
                )}
                {viewMode === "constructors" && <ConstructorStandingsList onSelect={setSelectedConstructor} standings={constructorStandings} drivers={standings} />}
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
