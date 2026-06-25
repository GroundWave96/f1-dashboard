"use client";

import { useState, UIEvent } from "react";
import Preloader from "../components/ui/Preloader/Preloader";
import SideNavigation from "../components/layout/SideNavigation";
import NextRace from "../components/f1/NextRace/NextRace";
import StandingsSection from "../components/f1/Standings/StandingsSection";
import CalendarSection from "../components/f1/Calendar/CalendarSection";
import LastRacesSection from "../components/f1/Results/LastRacesSection";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleScroll = (e: UIEvent<HTMLElement>) => {
    const target = e.currentTarget;
    const scrollableHeight = target.scrollHeight - target.clientHeight;
    if (scrollableHeight > 0) {
      setScrollProgress((target.scrollTop / scrollableHeight) * 100);
    }
  };

  return (
    <>
      {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}

      <main 
        className={`h-dvh w-full snap-y snap-mandatory bg-zinc-950 text-white font-sans ${
          isLoading ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"
        }`}
      >
        <SideNavigation />

        <section className="h-dvh w-full snap-start relative">
          <NextRace />
        </section>

        <section className="h-dvh w-full snap-start relative">
          <StandingsSection />
        </section>

        <section className="h-dvh w-full snap-start relative">
          <CalendarSection />
        </section>

        <section className="h-dvh w-full snap-start relative">
          <LastRacesSection />
        </section>
      </main>
    </>
  );
}