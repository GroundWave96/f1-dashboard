import Reveal from "../../components/layout/Reveal";
import PageTitle from "../../components/layout/PageTitle";
import { pageMetadata } from "../../lib/seo";
import LastRacesSection from "../../components/f1/Results/LastRacesSection";

export const metadata = pageMetadata({
  title: "Resultados",
  description:
    "Resultados de cada GP de Fórmula 1: corrida, sprint e qualificação, com grid de largada, voltas mais rápidas e temporadas anteriores.",
  path: "/resultados",
});

export default function ResultsPage() {
  return (
    <Reveal className="screen-fill">
      <PageTitle pt="Resultados da temporada de Fórmula 1" en="Formula 1 season results" />
      <LastRacesSection />
    </Reveal>
  );
}
