import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../i18n/LanguageContext";
import AppShell from "../components/layout/AppShell";
import { jsonLdHtml, websiteJsonLd } from "../lib/seo";
import PreloadResources from "../components/layout/PreloadResources";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  // Ocupa a tela toda no iPhone (atrás do entalhe/ilha); as barras se afastam dessas áreas com env(safe-area-inset-*)
  viewportFit: "cover",
  // No Android o teclado encolhe a área visível, como no iPhone
  interactiveWidget: "resizes-content",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://f1dash.pages.dev/"),

  title: {
    default: "F1 Dashboard | Fórmula 1 em tempo real",
    template: "%s | F1 Dashboard",
  },
  description: "Próxima corrida de Fórmula 1 no seu horário, tempos de cada sessão, campeonato, calendário e resultados da temporada.",
  applicationName: "F1 Dashboard",
  authors: [{ name: "Gabriel Pimentel", url: "https://gabrielpimentel.pages.dev/" }],

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "F1 Dashboard",
  },

  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },

  openGraph: {
    title: "F1 Dashboard | Fórmula 1 em tempo real",
    description: "Próxima corrida de Fórmula 1 no seu horário, tempos de cada sessão, campeonato, calendário e resultados da temporada.",
    type: "website",
    locale: "pt_BR",
    url: "https://f1dash.pages.dev/",
    siteName: "F1 Dashboard",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "F1 Dashboard - Acompanhe a temporada atual da Fórmula 1",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "F1 Dashboard | Fórmula 1 em tempo real",
    description: "Próxima corrida de Fórmula 1 no seu horário, tempos de cada sessão, campeonato, calendário e resultados da temporada.",
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} h-full antialiased`}
    >
      <body className={`${poppins.className} min-h-full bg-[#09090B] text-slate-100`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdHtml(websiteJsonLd)} />
        <PreloadResources />
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  );
}