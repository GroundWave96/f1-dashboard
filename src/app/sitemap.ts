import type { MetadataRoute } from "next";
import { PAGES, SITE_URL } from "../lib/site";

// Exportação estática: o arquivo é gerado no build
export const dynamic = "force-static";

// Páginas que mudam a cada fim de semana de corrida e páginas fixas
const DAILY = new Set(["/", "/sessao", "/campeonato", "/resultados"]);

/** Mapa de páginas para os buscadores. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return PAGES.map((path) => ({
    url: `${SITE_URL}${path === "/" ? "/" : path}`,
    lastModified: now,
    changeFrequency: DAILY.has(path) ? "daily" : "monthly",
    priority: path === "/" ? 1 : DAILY.has(path) ? 0.8 : 0.5,
  }));
}
