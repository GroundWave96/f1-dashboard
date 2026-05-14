import NextRace from "../components/f1/NextRace/NextRace";
import StandingsSection from "../components/f1/Standings/StandingsSection";
import LastRacesSection from "../components/f1/Results/LastRacesSection";

export default function Home() {
  return (
    <main className="h-dvh w-full overflow-y-auto snap-y snap-mandatory bg-zinc-950 text-white font-sans">

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 border-b border-zinc-800 p-2 sm:p-4 relative">
        <NextRace />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800 p-2 sm:p-4 relative">
        <StandingsSection />
      </section>

      <section className="h-dvh w-full snap-start flex items-center justify-center bg-zinc-950 p-2 sm:p-4 relative">
        <LastRacesSection />
      </section>

    </main>
  );
}