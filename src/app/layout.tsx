import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"], 
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "F1 Dashboard | Temporada Atual",
  description: "Acompanhe as próximas corridas, classificação de pilotos e resultados da Fórmula 1.",
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