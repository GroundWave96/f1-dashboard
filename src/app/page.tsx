import DriverStandings from "../components/f1/DriverStandings";
import NextRace from "../components/f1/NextRace";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-zinc-950 text-white font-sans">
      
      <section className="h-screen w-full snap-start flex items-center justify-center bg-zinc-950 border-b border-zinc-800 p-4 relative">
        <NextRace />
      </section>

      <section className="h-screen w-full snap-start flex items-center justify-center bg-zinc-900 border-b border-zinc-800 p-4">
         <DriverStandings />
      </section>

      <section className="h-screen w-full snap-start flex items-center justify-center bg-zinc-950">
        <h1 className="text-4xl font-bold text-gray-400">3. Resultados Anteriores</h1>
      </section>

    </main>
  );
}