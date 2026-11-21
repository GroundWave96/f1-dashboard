import Reveal from "../components/layout/Reveal";
import PageTitle from "../components/layout/PageTitle";
import { pageMetadata } from "../lib/seo";
import Footer from "../components/layout/Footer";
import NextRace from "../components/f1/NextRace/NextRace";
import HighlightsSection from "../components/f1/Highlights/HighlightsSection";
import LatestSession from "../components/f1/Session/LatestSession";

export const metadata = pageMetadata({
  description:
    "Contagem regressiva para a próxima corrida de Fórmula 1 no seu horário, programação do fim de semana, última sessão, campeonato e resumo da temporada.",
  path: "/",
});

/** Início: a próxima corrida ocupa a primeira tela; abaixo, a última sessão e o resumo da temporada. */
export default function HomePage() {
  return (
    <>
      <PageTitle pt="F1 Dashboard: próxima corrida, sessões e campeonato de Fórmula 1" en="F1 Dashboard: next race, sessions and Formula 1 standings" />
      <Reveal hero className="screen-fill">
        <NextRace />
      </Reveal>
      <Reveal>
        <LatestSession />
      </Reveal>
      <Reveal className="screen-fill-wide">
        <HighlightsSection />
      </Reveal>
      <Footer />
    </>
  );
}
