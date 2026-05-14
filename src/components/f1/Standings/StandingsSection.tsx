"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { DriverStanding, ConstructorStanding, Driver } from "../../../types/f1";
import DriverTable from "./DriverTable";
import ConstructorTable from "./ConstructorTable";
import DriverModal from "./DriverModal";

export default function StandingsSection() {
    const [view, setView] = useState<"drivers" | "constructors">("drivers");
    const [drivers, setDrivers] = useState<DriverStanding[]>([]);
    const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDriver, setSelectedDriver] = useState<{ driver: Driver, constructorName: string } | null>(null);

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
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center text-gray-400 gap-4">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Carregando Classificações...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-4 sm:gap-6 h-full py-4 sm:py-6">
            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="text-center sm:text-left">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Mundial de F1</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Classificação 2026</h2>
                </div>

                <div className="relative bg-zinc-900 p-1 rounded-full border border-zinc-800 flex items-center w-64 h-11">
                    <div 
                        className={`absolute h-9 w-[calc(50%-4px)] bg-red-600 rounded-full shadow-lg shadow-red-900/20 transition-transform duration-300 ease-in-out z-0 ${
                            view === "drivers" ? "translate-x-0" : "translate-x-full"
                        }`}
                    />
                    
                    <button 
                        onClick={() => setView("drivers")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "drivers" ? "text-white" : "text-gray-500"}`}
                    >
                        Pilotos
                    </button>
                    <button 
                        onClick={() => setView("constructors")}
                        className={`relative z-10 h-full flex-1 flex items-center justify-center text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "constructors" ? "text-white" : "text-gray-500"}`}
                    >
                        Equipes
                    </button>
                </div>
            </div>

            <div className="relative flex-1 min-h-0 w-full">
                {view === "drivers" ? (
                    <DriverTable 
                        standings={drivers} 
                        onRowClick={(driver, constructorName) => setSelectedDriver({driver, constructorName})} 
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