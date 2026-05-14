import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://f1dash.pages.dev/"),

  title: "F1 Dashboard | Temporada Atual",
  description: "Acompanhe as próximas corridas, classificação de pilotos e resultados da Fórmula 1 em tempo real.",

  openGraph: {
    title: "F1 Dashboard | Temporada Atual",
    description: "Acompanhe as próximas corridas, classificação de pilotos e resultados da Fórmula 1.",
    type: "website",
    locale: "pt_BR",
  },

  twitter: {
    card: "summary_large_image",
    title: "F1 Dashboard | Temporada Atual",
    description: "Tudo sobre a temporada atual da F1 em um só lugar.",
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
      <body className={`${poppins.className} min-h-full flex flex-col`}>
        {children}
      </body>
    </html>
  );
}