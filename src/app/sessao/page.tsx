import { Suspense } from "react";
import Reveal from "../../components/layout/Reveal";
import PageTitle from "../../components/layout/PageTitle";
import { pageMetadata } from "../../lib/seo";
import SessionPage from "../../components/f1/Session/SessionPage";

export const metadata = pageMetadata({
  title: "Sessão",
  description:
    "Tempos de cada treino, classificação e corrida da F1 desde 2023: grid com punições, pneus, linha do tempo da direção de prova, posições e telemetria.",
  path: "/sessao",
});

export default function SessionRoute() {
  return (
    <Reveal hero>
      <PageTitle pt="Sessão: tempos, pneus e telemetria de cada treino, classificação e corrida da F1" en="Session: timing, tyres and telemetry for every F1 practice, qualifying and race" />
      {/* A sessão escolhida fica no endereço (?s=...), lido só no navegador */}
      <Suspense>
        <SessionPage />
      </Suspense>
    </Reveal>
  );
}
