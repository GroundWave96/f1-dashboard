import { api } from "../../lib/api";
import { Race } from "../../types/f1";

export default async function NextRace() {
    const response = await api.get("current.json");
    const races: Race[] = response.data.MRData.RaceTable.Races;

    const now = new Date();

    const nextRace = races.find((race) => {
        const raceDate = new Date(`${race.date}T${race.time}`);
        return raceDate > now;
    });

    if (!nextRace) {
        return ( 
            <div className="text-center p-8 bg-zinc-900 border border-zinc-800 rounded-xl">
                <h2 className="text-2xl font-bold text-white">Temporada Finalizada</h2>
                <p className="text-gray-400 mt-2">Fique ligado para o próximo ano!</p>
            </div>
        );
    }

    const raceDateTime = new Date(`${nextRace.date}T${nextRace.time}`);
    const formattedDate = raceDateTime.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
    });
    const formattedTime = raceDateTime.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="flex flex-col items-center text-center p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
            <span className="text-red-500 font-bold uppercase tracking-widest text-sm mb-2">
                Próxima Etapa • Round {nextRace.round}
            </span>

            <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
                {nextRace.raceName}
            </h1>

            <div className="flex flex-col gap-1 mb-8">
                <p className="text-xl text-gray-300 font-medium">{nextRace.Circuit.circuitName}</p>
                <p className="text-gray-500">{nextRace.Circuit.Location.locality}, {nextRace.Circuit.Location.country}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full border-t border-zinc-800 pt-6">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Data</span>
                    <span className="text-white font-bold text-lg capitalize">{formattedDate}</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-gray-500 text-sm">Horário (Brasília)</span>
                    <span className="text-white font-bold text-lg">{formattedTime}</span>
                </div>
            </div>
        </div>
    );
}