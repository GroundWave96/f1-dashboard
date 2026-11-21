import type { MetadataRoute } from "next";
import { SITE_URL } from "../lib/site";

// Exportação estática: o arquivo é gerado no build
export const dynamic = "force-static";

/** Libera o site inteiro para os buscadores (a API de dados fica de fora) e aponta o mapa de páginas. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
