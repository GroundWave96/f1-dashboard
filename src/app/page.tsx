"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import Preloader from "../components/ui/Preloader/Preloader";
import SideNavigation from "../components/layout/SideNavigation";
import NextRace from "../components/f1/NextRace/NextRace";
import StandingsSection from "../components/f1/Standings/StandingsSection";
import CalendarSection from "../components/f1/Calendar/CalendarSection";
import LastRacesSection from "../components/f1/Results/LastRacesSection";

const INTRO_KEY = "f1dash-intro-seen";
const noopSubscribe = () => () => {};

// A animação completa das luzes roda uma vez por sessão; depois (ou com "reduzir movimento") só um fade rápido
function shouldSkipIntro() {
  try {
    if (sessionStorage.getItem(INTRO_KEY)) return true;
  } catch {
    // sessionStorage indisponível
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const skipIntro = useSyncExternalStore(noopSubscribe, shouldSkipIntro, () => false);

  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // sessionStorage indisponível
    }
    setIsLoading(false);
  }, []);

  return (
    <>
      {isLoading && <Preloader quick={skipIntro} onComplete={finishIntro} />}

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
