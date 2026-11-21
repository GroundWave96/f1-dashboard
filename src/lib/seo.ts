import type { Metadata } from "next";
import { AUTHOR_NAME, AUTHOR_URL, SITE_NAME, SITE_URL } from "./site";

const OG_IMAGE = { url: "/opengraph-image.png", width: 1200, height: 630, alt: "F1 Dashboard" };

/**
 * Metadados de uma página: título, descrição, endereço oficial (canonical, que também junta
 * variações como /sessao?s=11412) e a prévia ao compartilhar. O Open Graph da página substitui o do
 * layout por inteiro, então a imagem vai junto aqui.
 */
export function pageMetadata({ title, description, path }: { title?: string; description: string; path: string }): Metadata {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Fórmula 1 em tempo real`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SITE_NAME,
      locale: "pt_BR",
      type: "website",
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE.url] },
  };
}

/** Dados estruturados: o site e o autor (vale para todas as páginas). */
export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  inLanguage: ["pt-BR", "en"],
  description: "Próxima corrida, sessões, campeonato, calendário e resultados da Fórmula 1, com horários no seu fuso.",
  author: { "@type": "Person", name: AUTHOR_NAME, url: AUTHOR_URL },
};

/** <script type="application/ld+json">: escapa "<" para o conteúdo nunca fechar a tag. */
export const jsonLdHtml = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
