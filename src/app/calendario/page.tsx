import type { Metadata } from "next";
import Reveal from "../../components/layout/Reveal";
import CalendarSection from "../../components/f1/Calendar/CalendarSection";

export const metadata: Metadata = { title: "Calendário" };

export default function CalendarPage() {
  return (
    <Reveal className="screen-fill">
      <CalendarSection />
    </Reveal>
  );
}
