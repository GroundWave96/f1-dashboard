import Reveal from "../../components/layout/Reveal";
import Footer from "../../components/layout/Footer";
import FaqPage from "../../components/info/FaqPage";
import { dictionaries } from "../../i18n/dictionaries";
import { jsonLdHtml, pageMetadata } from "../../lib/seo";

export const metadata = pageMetadata({
  title: "Perguntas frequentes",
  description:
    "Dúvidas comuns sobre a F1 e o site: horário das corridas no seu fuso, grid e punições, volta anulada, safety car, cores dos pneus e como instalar o app.",
  path: "/perguntas",
});

// Dados estruturados de perguntas e respostas: o Google pode mostrar as respostas direto na busca
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: dictionaries.pt.faq.items.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function FaqRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(faqJsonLd)} />
      <Reveal>
        <FaqPage />
      </Reveal>
      <Footer />
    </>
  );
}
