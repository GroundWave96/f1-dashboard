import Reveal from "../../components/layout/Reveal";
import PageTitle from "../../components/layout/PageTitle";
import { pageMetadata } from "../../lib/seo";
import StandingsSection from "../../components/f1/Standings/StandingsSection";

export const metadata = pageMetadata({
  title: "Campeonato",
  description:
    "Classificação do campeonato de pilotos e de construtores da Fórmula 1, com os pontos de cada um e a evolução rodada a rodada.",
  path: "/campeonato",
});

export default function StandingsPage() {
  return (
    <Reveal className="screen-fill">
      <PageTitle pt="Campeonato de pilotos e construtores da Fórmula 1" en="Formula 1 drivers' and constructors' standings" />
      <StandingsSection />
    </Reveal>
  );
}
