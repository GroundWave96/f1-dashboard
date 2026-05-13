import DriverStandings from "../components/f1/DriverStandings";

export default function Home() {
  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-zinc-950 text-white font-sans">
      
      <section className="h-screen w-full snap-start flex items-center justify-center bg-zinc-950 border-b border-zinc-800">
        <h1 className="text-4xl font-bold text-red-500">1. Próxima Corrida</h1>
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