"use client";

import React, { createContext, useCallback, useContext, useState, useSyncExternalStore } from "react";
import Preloader from "../ui/Preloader/Preloader";
import { Rail, TabBar, TopBar } from "./Navigation";

const INTRO_KEY = "f1dash-intro-seen";
const noopSubscribe = () => () => {};

// A abertura completa roda uma vez por sessão; depois (ou com "reduzir movimento") só um fade rápido
function shouldSkipIntro() {
  try {
    if (sessionStorage.getItem(INTRO_KEY)) return true;
  } catch {
    // sessionStorage indisponível
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// true depois da abertura: as animações de entrada das páginas só começam a partir daí
const ReadyContext = createContext(false);
export const useAppReady = () => useContext(ReadyContext);

/**
 * Casco do aplicativo: fundo, barra lateral (computador) ou barras de cima e de abas (celular),
 * e a abertura na primeira visita. As páginas rolam normalmente; nada de rolagem dentro de rolagem.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  // ready: a abertura começou a sair (as páginas já podem animar); introGone: ela pode ser removida
  const [ready, setReady] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const skipIntro = useSyncExternalStore(noopSubscribe, shouldSkipIntro, () => false);

  const reveal = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_KEY, "1");
    } catch {
      // sessionStorage indisponível
    }
    setReady(true);
  }, []);
  const removeIntro = useCallback(() => setIntroGone(true), []);

  return (
    <ReadyContext.Provider value={ready}>
      <div aria-hidden="true" className="app-backdrop" />
      {!introGone && <Preloader quick={skipIntro} onReveal={reveal} onDone={removeIntro} />}

      <div id="app" className="min-h-dvh font-sans text-white">
        <Rail />
        <div className="app-content">
          <TopBar />
          <main>{children}</main>
        </div>
        <TabBar />
      </div>
    </ReadyContext.Provider>
  );
}
