import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "../i18n/LanguageContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const viewport: Viewport = {
  themeColor: "#09090B",
  colorScheme: "dark",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://f1dash.pages.dev/"),

  title: "F1 Dashboard | Temporada Atual",
  description: "Acompanhe as próximas corridas, classificação de pilotos e resultados da Fórmula 1 em tempo real.",

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
    title: "F1 Dashboard | Temporada Atual",
    description: "Acompanhe as próximas corridas, classificação de pilotos e resultados da Fórmula 1.",
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
    title: "F1 Dashboard | Temporada Atual",
    description: "Tudo sobre a temporada atual da F1 em um só lugar.",
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
      <body className={`${poppins.className} min-h-full flex flex-col bg-[#09090B] text-slate-100`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}