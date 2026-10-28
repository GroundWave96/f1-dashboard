import React from "react";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";
import Select from "../../ui/Select";
import SegmentedControl from "../../ui/SegmentedControl";

export type ViewMode = "races" | "drivers" | "constructors";

interface RaceNavigationProps {
    currentRace: PastRace;
    viewMode: ViewMode;
    onViewChange: (mode: ViewMode) => void;
    selectedSeason: string;
    onSeasonChange: (season: string) => void;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    // Abas Corrida / Sprint / Qualificação (só na visão de corridas)
    sessionTabs: React.ReactNode;
}

function ArrowButton({ direction, enabled, onClick, label }: { direction: "prev" | "next"; enabled: boolean; onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={!enabled}
            aria-label={label}
            className={`flex items-center gap-1.5 h-9 rounded-full border px-3 text-xs font-bold uppercase tracking-wider transition-[background-color,color,scale] duration-150 ease-fluid ${
                enabled
                    ? "border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white motion-safe:active:scale-[0.96]"
                    : "border-zinc-800/60 text-zinc-700 cursor-not-allowed"
            }`}
        >
            {direction === "prev" && <span aria-hidden="true">&larr;</span>}
            <span className="hidden sm:inline">{label}</span>
            {direction === "next" && <span aria-hidden="true">&rarr;</span>}
        </button>
    );
}

export default function RaceNavigation({
    currentRace,
    viewMode,
    onViewChange,
    selectedSeason,
    onSeasonChange,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    sessionTabs,
}: RaceNavigationProps) {
    const { dict, lang } = useLanguage();
    const locale = lang === "pt" ? "pt-BR" : "en-US";

    const formattedDate = new Date(`${currentRace.date}T${currentRace.time || "00:00:00Z"}`).toLocaleDateString(locale, {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from(new Array(currentYear - 1950), (_, index) => {
        const year = String(currentYear - 1 - index);
        return { value: year, label: year };
    });

    const isStandings = viewMode !== "races";

    return (
        <div className="reveal shrink-0 flex flex-col gap-3" style={{ "--i": 0 } as React.CSSProperties}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0 text-center lg:text-left">
                    <span className="block text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
                        {isStandings ? `${dict.standings.season} ${currentRace.season}` : `${dict.results.round} ${currentRace.round} • ${formattedDate}`}
                    </span>
                    <h2 className="font-bold text-white uppercase tracking-wider leading-tight text-[clamp(1.2rem,0.9rem+1.1vw,2.1rem)] text-balance">
                        {isStandings ? dict.standings.title : currentRace.raceName}
                    </h2>
                    <p className="text-zinc-400 text-xs sm:text-sm truncate hide-compact">
                        {isStandings ? (viewMode === "drivers" ? dict.standings.drivers : dict.standings.teams) : currentRace.Circuit.circuitName}
                    </p>
                </div>

                <div className="flex items-center justify-center lg:justify-end gap-2 shrink-0">
                    <Select
                        value={selectedSeason}
                        options={[{ value: "current", label: dict.results.current }, ...yearOptions]}
                        onChange={onSeasonChange}
                        ariaLabel={dict.results.selectSeason}
                        align="right"
                    />
                    <SegmentedControl
                        className="w-60 sm:w-72"
                        value={viewMode}
                        onChange={onViewChange}
                        options={[
                            { value: "races", label: dict.results.racesTab },
                            { value: "drivers", label: dict.standings.drivers },
                            { value: "constructors", label: dict.standings.teams },
                        ]}
                    />
                </div>
            </div>

            {!isStandings && (
                <div className="flex items-end justify-between gap-3 border-b border-zinc-800/80">
                    {sessionTabs}
                    <div className="flex items-center gap-2 pb-2">
                        <ArrowButton direction="prev" enabled={hasPrevious} onClick={onPrevious} label={dict.results.previous} />
                        <ArrowButton direction="next" enabled={hasNext} onClick={onNext} label={dict.results.next} />
                    </div>
                </div>
            )}
        </div>
    );
}
