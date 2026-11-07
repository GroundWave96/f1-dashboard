"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "../../i18n/LanguageContext";
import { apiGet } from "../../lib/api";
import { useAsyncData, useNow } from "../../lib/hooks";
import { getRaceSessions } from "../../lib/sessions";
import type { Race } from "../../types/f1";
import { AboutButton, LanguageToggle } from "./Controls";

type NavKey = "home" | "session" | "standings" | "calendar" | "results";

const ICONS: Record<NavKey, React.ReactNode> = {
  home: <path d="M3.5 10.2 12 3.5l8.5 6.7V20a1 1 0 0 1-1 1H15v-6.2H9V21H4.5a1 1 0 0 1-1-1z" />,
  session: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 9.5v4l2.6 2.2M9.5 2.5h5M12 2.5V6M18.4 6.6l1.4-1.4" />
    </>
  ),
  standings: <path d="M3.5 20.5h17M5 20.5v-6h4.5v6M9.5 20.5V9h5v11.5M14.5 20.5v-8.5H19v8.5M12 3.5l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 5.6l2-.3z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4M8 14h2M14 14h2M8 17.5h2" />
    </>
  ),
  results: <path d="M5 21V3.5M5 4h12.5l-2 4.25 2 4.25H5M8.5 4v8.5M12 4v8.5M5 8.25h12.5" />,
};

export const NAV_ITEMS: { key: NavKey; href: string }[] = [
  { key: "home", href: "/" },
  { key: "session", href: "/sessao" },
  { key: "standings", href: "/campeonato" },
  { key: "calendar", href: "/calendario" },
  { key: "results", href: "/resultados" },
];

function NavIcon({ name, className = "w-6 h-6" }: { name: NavKey; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

async function loadCalendar(): Promise<Race[]> {
  const data = await apiGet("current.json");
  return data.RaceTable?.Races ?? [];
}

/** true enquanto algum treino, qualificação ou corrida está acontecendo (usa o calendário já carregado pelo site). */
function useSessionLive() {
  const now = useNow(30_000);
  const { data: races } = useAsyncData("calendar:current", loadCalendar);
  return Boolean(races?.some((race) => getRaceSessions(race).some((s) => s.start.getTime() <= now && now < s.end.getTime())));
}

/** Pontinho vermelho piscando sobre o ícone da aba Sessão durante uma sessão ao vivo. */
function LiveDot() {
  return (
    <span className="absolute -right-1 -top-0.5 flex h-2.5 w-2.5" aria-hidden="true">
      <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-70 motion-safe:animate-ping" />
      <span className="relative inline-flex h-2.5 w-2.5 rounded-full border border-zinc-900 bg-red-500" />
    </span>
  );
}

function useActiveIndex() {
  const pathname = usePathname() ?? "/";
  const path = pathname.replace(/\/$/, "") || "/";
  return NAV_ITEMS.findIndex((item) => (item.href === "/" ? path === "/" : path === item.href || path.startsWith(`${item.href}/`)));
}

/**
 * Barra de abas flutuante, de vidro (celular e tablet em pé). O destaque desliza até a aba ativa.
 */
export function TabBar() {
  const { dict } = useLanguage();
  const active = useActiveIndex();
  const live = useSessionLive();

  return (
    <nav aria-label={dict.nav.label} className="rail:hidden fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] pointer-events-none">
      <ul className="glass-chrome pointer-events-auto relative grid grid-cols-5 w-full max-w-md h-16 p-1.5 rounded-[1.75rem]">
        {active >= 0 && (
          <span
            aria-hidden="true"
            className="absolute top-1.5 bottom-1.5 left-1.5 w-[calc((100%-0.75rem)/5)] rounded-[1.35rem] bg-white/10 transition-transform duration-500 ease-fluid"
            style={{ transform: `translateX(${active * 100}%)` }}
          />
        )}
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === active;
          return (
            <li key={item.key} className="relative">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`tap flex h-full flex-col items-center justify-center gap-0.5 rounded-[1.35rem] transition-colors duration-200 ${isActive ? "text-white" : "text-zinc-400 active:text-white"}`}
              >
                <span className="relative">
                  <NavIcon name={item.key} className={`w-[1.4rem] h-[1.4rem] transition-colors duration-200 ${isActive ? "text-red-500" : ""}`} />
                  {live && item.key === "session" && <LiveDot />}
                </span>
                <span className="text-[10px] font-semibold tracking-wide">{dict.nav[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/**
 * Barra lateral de vidro (computador, tablet deitado e celular deitado), com logo, abas,
 * "Sobre" e idioma. No celular deitado fica só com os ícones para caber na altura.
 */
export function Rail() {
  const { dict } = useLanguage();
  const active = useActiveIndex();
  const live = useSessionLive();

  return (
    <nav
      aria-label={dict.nav.label}
      className="hidden rail:flex glass-chrome fixed z-40 left-3 top-3 bottom-3 w-[var(--rail-width)] flex-col items-center justify-between py-5 rounded-[1.75rem] [@media(max-height:520px)]:py-2.5"
    >
      <Link href="/" aria-label={dict.nav.home} className="tap block w-12 [@media(max-height:520px)]:hidden">
        <Image src="/teams/f1.svg" alt="F1" width={96} height={24} className="w-full h-auto" priority />
      </Link>

      <ul className="relative flex flex-col gap-1">
        {active >= 0 && (
          <span
            aria-hidden="true"
            className="absolute left-0 right-0 top-0 h-[var(--rail-item)] rounded-2xl bg-white/10 transition-transform duration-500 ease-fluid"
            style={{ transform: `translateY(calc(${active} * (var(--rail-item) + 0.25rem)))` }}
          />
        )}
        {NAV_ITEMS.map((item, index) => {
          const isActive = index === active;
          return (
            <li key={item.key} className="relative">
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                aria-label={dict.nav[item.key]}
                className={`tap flex h-[var(--rail-item)] w-[calc(var(--rail-width)-1rem)] flex-col items-center justify-center gap-1 rounded-2xl transition-colors duration-200 ${isActive ? "text-white" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
              >
                <span className="relative">
                  <NavIcon name={item.key} className={`w-6 h-6 transition-colors duration-200 ${isActive ? "text-red-500" : ""}`} />
                  {live && item.key === "session" && <LiveDot />}
                </span>
                <span className="text-[10px] font-semibold tracking-wide [@media(max-height:520px)]:hidden">{dict.nav[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-col items-center gap-3">
        <AboutButton placement="side" />
        <div className="[@media(max-height:520px)]:hidden">
          <LanguageToggle />
        </div>
      </div>
    </nav>
  );
}

/** Barra de cima no celular: logo, "Sobre" e idioma. Fica fixa, em vidro, com o conteúdo passando por baixo. */
export function TopBar() {
  const { dict } = useLanguage();
  return (
    <header className="rail:hidden sticky top-0 z-30 glass-bar pt-[env(safe-area-inset-top)]">
      <div className="shell flex h-14 items-center justify-between">
        <Link href="/" aria-label={dict.nav.home} className="tap block w-20">
          <Image src="/teams/f1.svg" alt="F1" width={96} height={24} className="w-full h-auto" priority />
        </Link>
        <div className="flex items-center gap-3">
          <AboutButton />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
