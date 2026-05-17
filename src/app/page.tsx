"use client";

import { useState } from "react";
import NextRace from "../components/f1/NextRace/NextRace";
import StandingsSection from "../components/f1/Standings/StandingsSection";
import LastRacesSection from "../components/f1/Results/LastRacesSection";
import Preloader from "../components/f1/Preloader/Preloader"; // Verifique se este caminho está correto

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* O Preloader fica por cima de tudo. Quando terminar, ele muda o estado para false e se destrói */}
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      <main 
        className={`h-dvh w-full snap-y snap-mandatory bg-zinc-950 text-white font-sans ${
          isLoading ? "overflow-hidden" : "overflow-y-auto"
        }`}
      >
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
    </>
  );
}