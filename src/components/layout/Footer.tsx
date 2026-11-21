"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageContext";
import { mailto } from "../../lib/site";

/** Rodapé: links para as páginas fora das abas (perguntas, sobre e contato, sugestão) e o crédito. */
export default function Footer() {
  const { dict } = useLanguage();
  const link = "tap rounded-full px-2 py-1 text-xs font-semibold text-zinc-400 transition-colors hover:text-white";

  return (
    <footer className="shrink-0 flex flex-col items-center gap-3 text-center pt-2 pb-6">
      <nav aria-label={dict.footer.linksLabel}>
        <ul className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <li>
            <Link href="/perguntas" className={link}>
              {dict.footer.faq}
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-700">·</li>
          <li>
            <Link href="/sobre" className={link}>
              {dict.footer.about}
            </Link>
          </li>
          <li aria-hidden="true" className="text-zinc-700">·</li>
          <li>
            <a href={mailto(dict.about.suggestSubject)} className={link}>
              {dict.footer.suggest}
            </a>
          </li>
        </ul>
      </nav>
      <p className="text-[10px] sm:text-xs text-muted uppercase tracking-widest font-medium">
        Designed & Developed by{" "}
        <a
          href="https://gabrielpimentel.pages.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block text-red-500 hover:text-red-400 transition-colors font-bold after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1.5px] after:bottom-0 after:left-0 after:bg-red-500 after:origin-bottom-left after:transition-transform after:duration-300 hover:after:scale-x-100"
          title={dict.footer.portfolioTitle}
        >
          Gabriel Pimentel
        </a>
      </p>
    </footer>
  );
}