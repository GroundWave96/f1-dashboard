"use client";

import React, { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { DriverStanding, ConstructorStanding } from "../../../types/f1";
import DriverTable from "./DriverTable";
import ConstructorTable from "./ConstructorTable";

export default function StandingsSection() {
    const [view, setView] = useState<"drivers" | "constructors">("drivers");
    const [drivers, setDrivers] = useState<DriverStanding[]>([]);
    const [constructors, setConstructors] = useState<ConstructorStanding[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="w-full max-w-4xl mx-auto px-2 flex flex-col gap-6">
            
            {/* MINI-TÍTULO E SWITCH */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                    <span className="text-red-500 font-bold uppercase tracking-widest text-[10px]">Mundial de F1</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider">Classificação 2026</h2>
                </div>

                {/* SWITCH ANIMADO ESTILO PÍLULA */}
                <div className="relative bg-zinc-900 p-1 rounded-full border border-zinc-800 flex items-center w-64 h-11">
                    {/* Background Deslizante (A mágica da transição) */}
                    <div 
                        className={`absolute h-9 w-31 bg-red-600 rounded-full shadow-lg shadow-red-900/20 transition-all duration-300 ease-in-out ${
                            view === "drivers" ? "translate-x-0" : "translate-x-31.5"
                        }`}
                    />
                    
                    <button 
                        onClick={() => setView("drivers")}
                        className={`relative flex-1 text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "drivers" ? "text-white" : "text-gray-500"}`}
                    >
                        Pilotos
                    </button>
                    <button 
                        onClick={() => setView("constructors")}
                        className={`relative flex-1 text-xs font-bold uppercase tracking-tight transition-colors duration-300 ${view === "constructors" ? "text-white" : "text-gray-500"}`}
                    >
                        Equipes
                    </button>
                </div>
            </div>

            {/* TABELAS COM TRANSIÇÃO SIMPLES */}
            <div className="relative overflow-hidden">
                {view === "drivers" ? (
                    <DriverTable standings={drivers} />
                ) : (
                    <ConstructorTable standings={constructors} />
                )}
            </div>
            
        </div>
    );
}