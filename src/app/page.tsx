import Reveal from "../components/layout/Reveal";
import Footer from "../components/layout/Footer";
import NextRace from "../components/f1/NextRace/NextRace";
import HighlightsSection from "../components/f1/Highlights/HighlightsSection";
import LatestSession from "../components/f1/Session/LatestSession";

/** Início: a próxima corrida ocupa a primeira tela; abaixo, a última sessão e o resumo da temporada. */
export default function HomePage() {
  return (
    <>
      <Reveal className="screen-fill">
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
