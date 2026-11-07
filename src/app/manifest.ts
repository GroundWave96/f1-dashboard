import type { MetadataRoute } from "next";

// Gerado no build (arquivo estático): permite instalar o site na tela inicial, abrindo em tela cheia como um app
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "F1 Dashboard",
    short_name: "F1 Dash",
    description: "Próxima corrida, sessões, campeonato, calendário e resultados da Fórmula 1.",
    lang: "pt-BR",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#09090B",
    theme_color: "#09090B",
    categories: ["sports"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Sessão", url: "/sessao" },
      { name: "Campeonato", url: "/campeonato" },
      { name: "Calendário", url: "/calendario" },
    ],
  };
}
