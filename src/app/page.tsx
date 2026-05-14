import DriverStandings from "../components/f1/DriverStandings";
import NextRace from "../components/f1/NextRace";
import LastRaceResults from "../components/f1/LastRaceResults";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-zinc-950 text-white font-sans">
      
      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 border-b border-zinc-800 p-4 relative">
        <NextRace />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800 p-4">
         <DriverStandings />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 p-4">
        <LastRaceResults />
      </section>

    </main>
  );
}