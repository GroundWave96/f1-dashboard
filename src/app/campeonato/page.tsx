import type { Metadata } from "next";
import Reveal from "../../components/layout/Reveal";
import StandingsSection from "../../components/f1/Standings/StandingsSection";

export const metadata: Metadata = { title: "Campeonato" };

export default function StandingsPage() {
  return (
    <Reveal className="screen-fill">
      <StandingsSection />
    </Reveal>
  );
}
