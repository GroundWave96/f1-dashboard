import { Suspense } from "react";
import type { Metadata } from "next";
import Reveal from "../../components/layout/Reveal";
import SessionPage from "../../components/f1/Session/SessionPage";

export const metadata: Metadata = { title: "Sessão" };

export default function SessionRoute() {
  return (
    <Reveal>
      {/* A sessão escolhida fica no endereço (?s=...), lido só no navegador */}
      <Suspense>
        <SessionPage />
      </Suspense>
    </Reveal>
  );
}
