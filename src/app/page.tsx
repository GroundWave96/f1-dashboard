"use client";

import { useState, UIEvent } from "react";
import NextRace from "../components/f1/NextRace/NextRace";
import StandingsSection from "../components/f1/Standings/StandingsSection";
import LastRacesSection from "../components/f1/Results/LastRacesSection";
import Preloader from "../components/f1/Preloader/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const scrollableHeight = target.scrollHeight - target.clientHeight;
    
    if (scrollableHeight > 0) {
      const progress = (target.scrollTop / scrollableHeight) * 100;
      setScrollProgress(progress);
    }
  };

  return (
    <>
      <div 
        className="fixed top-0 left-0 h-1.5 w-full bg-red-600 origin-left z-60 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
        style={{ transform: `scaleX(${scrollProgress / 100})` }}
      />

      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      <main 
        onScroll={handleScroll}
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