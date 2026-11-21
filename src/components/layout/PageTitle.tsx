"use client";

import { useLanguage } from "../../i18n/LanguageContext";

/**
 * Título principal (h1) da página, só para leitores de tela e buscadores: o visual de cada página já
 * tem o próprio cabeçalho. No HTML gerado sai em português (o idioma padrão do site).
 */
export default function PageTitle({ pt, en }: { pt: string; en: string }) {
  const { lang } = useLanguage();
  return <h1 className="sr-only">{lang === "pt" ? pt : en}</h1>;
}
