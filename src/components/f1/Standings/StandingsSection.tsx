import React from "react";
import { api } from "../../../lib/api";
import { DriverStanding } from "../../../types/f1";
import DriverTable from "./DriverTable";

export default async function StandingsSection() {
    // 1. Busca os dados no servidor
    const response = await api.get("current/driverStandings.json");
    const standings: DriverStanding[] = response.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];

    // 2. Renderiza o layout principal da seção
    return (
        <div className="w-full max-w-4xl mx-auto px-2">
            
            {/* Espaço reservado para colocar os botões de Switch depois */}

            {/* Chama o componente filho passando os dados */}
            <DriverTable standings={standings} />
            
        </div>
    );
}