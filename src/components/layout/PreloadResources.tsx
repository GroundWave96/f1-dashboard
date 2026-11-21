"use client";

import ReactDOM from "react-dom";

/**
 * Pede ao navegador, já no carregamento da página, o calendário da temporada (usado pelo Início e pelo
 * ponto "ao vivo" das abas) e abre a conexão com o site das bandeiras. Assim os dados chegam enquanto o
 * resto do site ainda carrega, e a primeira tela aparece antes.
 */
export default function PreloadResources() {
  ReactDOM.preload("/api/jolpica/current.json", { as: "fetch", crossOrigin: "anonymous" });
  ReactDOM.preconnect("https://flagcdn.com");
  return null;
}
