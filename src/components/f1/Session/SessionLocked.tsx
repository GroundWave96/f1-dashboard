"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "../../../i18n/LanguageContext";
import { loadCalendar } from "../../../lib/api";
import { useAsyncData, useNow } from "../../../lib/hooks";
import { getRaceSessions, type SessionKey } from "../../../lib/sessions";

const RETRY_MS = 60_000;
// Uma sessão com atraso ou bandeira vermelha pode passar bem do horário previsto
const RECENT_MS = 5 * 60 * 60_000;

/** Sessão que começou há pouco, pelo calendário (a lista de sessões do OpenF1 também fica bloqueada). */
function useRecentSession(): { key: SessionKey; place: string } | null {
  const now = useNow(RETRY_MS);
  const { data: races } = useAsyncData("calendar:current", loadCalendar);
  let found: { key: SessionKey; place: string } | null = null;
  for (const race of races ?? []) {
    for (const session of getRaceSessions(race)) {
      const start = session.start.getTime();
      if (start <= now && now - start < RECENT_MS) found = { key: session.key, place: race.Circuit.Location.locality };
    }
  }
  return found;
}

interface SessionLockedProps {
  // Nova tentativa em segundo plano (o aviso continua na tela até os dados chegarem)
  onRetry: () => void;
  // Botão "Tentar agora"
  onRetryNow: () => void;
}

/**
 * Aviso de quando o OpenF1 gratuito bloqueia os dados durante uma sessão ao vivo.
 * Tenta de novo sozinho a cada minuto e dá atalhos para o resto do site enquanto isso.
 */
export default function SessionLocked({ onRetry, onRetryNow }: SessionLockedProps) {
  const { dict } = useLanguage();
  const t = dict.session;
  const recent = useRecentSession();

  const retry = useRef(onRetry);
  useEffect(() => {
    retry.current = onRetry;
  });
  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) retry.current();
    }, RETRY_MS);
    return () => clearInterval(id);
  }, []);

  const shortcuts = [
    { href: "/resultados", label: dict.nav.results },
    { href: "/campeonato", label: dict.nav.standings },
    { href: "/calendario", label: dict.nav.calendar },
  ];

  return (
    <div className="glass mx-auto flex w-full max-w-xl flex-col items-center gap-6 rounded-3xl px-6 py-8 text-center sm:px-10 sm:py-10">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/25">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="13.5" r="7.5" />
          <path d="M12 9.5v4l2.6 2.2M9.5 2.5h5M12 2.5V6M18.4 6.6l1.4-1.4" />
        </svg>
      </span>

      <div className="flex flex-col items-center gap-2">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-red-400">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          {recent ? `${dict.sessions[recent.key]} · ${recent.place}` : t.lockedEyebrow}
        </span>
        <h2 className="text-xl font-bold uppercase tracking-wider text-white text-balance sm:text-2xl">{t.lockedTitle}</h2>
        <p className="max-w-[52ch] text-sm leading-relaxed text-zinc-300 text-pretty">{t.locked}</p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onRetryNow}
          className="tap rounded-full bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition-[background-color,scale] duration-150 ease-out hover:bg-white/15 active:scale-[0.96]"
        >
          {t.tryNow}
        </button>
        <span className="text-xs text-zinc-500">{t.autoRetry}</span>
      </div>

      <nav aria-label={t.meanwhile} className="flex w-full flex-col items-center gap-3 border-t border-white/10 pt-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{t.meanwhile}</span>
        <div className="flex flex-wrap justify-center gap-2">
          {shortcuts.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tap inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold uppercase tracking-wide text-zinc-200 transition-[background-color,scale] duration-150 ease-out hover:bg-white/10 active:scale-[0.96]"
            >
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
