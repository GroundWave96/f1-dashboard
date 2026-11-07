import Reveal from "../components/layout/Reveal";
import Footer from "../components/layout/Footer";
import NextRace from "../components/f1/NextRace/NextRace";
import HighlightsSection from "../components/f1/Highlights/HighlightsSection";

/** Início: a próxima corrida ocupa a primeira tela; abaixo, o resumo da temporada. */
export default function HomePage() {
  return (
    <>
      <Reveal className="screen-fill">
        <NextRace />
      </Reveal>
      <Reveal className="screen-fill-wide">
        <HighlightsSection />
      </Reveal>
      <Footer />
    </>
  );
}
