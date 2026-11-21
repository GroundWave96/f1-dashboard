import Reveal from "../../components/layout/Reveal";
import Footer from "../../components/layout/Footer";
import AboutPage from "../../components/info/AboutPage";
import { pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Sobre e contato",
  description:
    "Sobre o F1 Dashboard, um projeto independente de fã: quem fez, de onde vêm os dados (Jolpica e OpenF1), privacidade e como enviar sugestões ou falar com o autor.",
  path: "/sobre",
});

export default function AboutRoute() {
  return (
    <>
      <Reveal>
        <AboutPage />
      </Reveal>
      <Footer />
    </>
  );
}
