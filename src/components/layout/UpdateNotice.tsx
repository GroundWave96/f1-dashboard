"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

const CURRENT = process.env.NEXT_PUBLIC_APP_VERSION;
const CHECK_EVERY_MS = 5 * 60_000;
const DISMISSED_KEY = "f1dash-update-dismissed";

/**
 * Aviso de versão nova: confere /version.json quando a pessoa volta para a aba e a cada 5 minutos.
 * Se a versão publicada mudou, mostra o aviso embaixo, no centro, com "Atualizar" (recarrega a página)
 * e "Depois" (some até a próxima versão).
 */
export default function UpdateNotice() {
  const { dict } = useLanguage();
  const [newVersion, setNewVersion] = useState<string | null>(null);

  useEffect(() => {
    if (!CURRENT || CURRENT === "dev") return;
    let cancelled = false;

    const check = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch("/version.json", { cache: "no-store" });
        if (!res.ok) return;
        const { version } = (await res.json()) as { version?: string };
        let dismissed: string | null = null;
        try {
          dismissed = sessionStorage.getItem(DISMISSED_KEY);
        } catch {
          // sessionStorage indisponível
        }
        if (!cancelled && version && version !== CURRENT && version !== dismissed) setNewVersion(version);
      } catch {
        // sem internet: tenta de novo na próxima vez
      }
    };

    const onVisible = () => document.visibilityState === "visible" && check();
    const timer = setInterval(check, CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", check);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", check);
    };
  }, []);

  if (!newVersion) return null;

  const later = () => {
    try {
      sessionStorage.setItem(DISMISSED_KEY, newVersion);
    } catch {
      // sessionStorage indisponível
    }
    setNewVersion(null);
  };

  return (
    // Acima da barra de abas no celular; no computador, centralizado na área ao lado da barra lateral
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--chrome-bottom)+0.75rem)] z-[45] flex justify-center px-3 rail:bottom-5 rail:pl-[var(--chrome-left)]">
      <div
        role="status"
        className="glass-chrome pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-2xl py-2.5 pl-3.5 pr-2.5 shadow-2xl animate-in fade-in motion-safe:slide-in-from-bottom-4 duration-300"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-400" aria-hidden="true">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" />
          </svg>
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-semibold leading-snug text-white text-pretty">{dict.update.message}</span>
        <button
          type="button"
          onClick={later}
          className="tap shrink-0 rounded-full px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          {dict.update.later}
        </button>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="tap shrink-0 rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white transition-[background-color,scale] duration-150 hover:bg-red-500 active:scale-[0.96]"
        >
          {dict.update.reload}
        </button>
      </div>
    </div>
  );
}
