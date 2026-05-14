import DriverStandings from "../components/f1/DriverStandings";
import NextRace from "../components/f1/NextRace";
import LastRaceResults from "../components/f1/LastRaceResults";

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-y-auto snap-y snap-mandatory bg-zinc-950 text-white font-sans">
      
      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 border-b border-zinc-800 p-2 sm:p-4 relative">
        <NextRace />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800 p-2 sm:p-4 relative">
         <DriverStandings />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 p-2 sm:p-4 relative">
        <LastRaceResults />
      </section>

    </main>
  );
}