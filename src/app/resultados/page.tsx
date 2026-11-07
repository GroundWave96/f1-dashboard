import type { Metadata } from "next";
import Reveal from "../../components/layout/Reveal";
import LastRacesSection from "../../components/f1/Results/LastRacesSection";

export const metadata: Metadata = { title: "Resultados" };

export default function ResultsPage() {
  return (
    <Reveal className="screen-fill">
      <LastRacesSection />
    </Reveal>
  );
}
