import Reveal from "../../components/layout/Reveal";
import PageTitle from "../../components/layout/PageTitle";
import { pageMetadata } from "../../lib/seo";
import CalendarSection from "../../components/f1/Calendar/CalendarSection";

export const metadata = pageMetadata({
  title: "Calendário",
  description:
    "Calendário completo da temporada de Fórmula 1: datas, horários de cada sessão no seu fuso, traçado das pistas e vencedores de cada GP.",
  path: "/calendario",
});

export default function CalendarPage() {
  return (
    <Reveal className="screen-fill">
      <PageTitle pt="Calendário da temporada de Fórmula 1" en="Formula 1 season calendar" />
      <CalendarSection />
    </Reveal>
  );
}
