"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageContext";
import { useMediaQuery } from "../../lib/hooks";
import { AUTHOR_URL, mailto } from "../../lib/site";
import { InstallRow } from "./InstallApp";

const TECH = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Cloudflare"];

/**
 * Botão "Sobre o projeto" com o cartão de informações.
 * `placement`: abaixo e à direita (barra de cima) ou ao lado (barra lateral do computador).
 * No celular o cartão abre no meio da tela, renderizado direto no <body>: dentro da barra de vidro
 * (backdrop-filter) o "fixed" ficaria preso à barra e o cartão sairia da tela.
 */
export function AboutButton({ placement = "below" }: { placement?: "below" | "side" }) {
  const { dict } = useLanguage();
  const [open, setOpen] = useState(false);
  const wide = useMediaQuery("(min-width: 640px)");
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!panelRef.current?.contains(target) && !buttonRef.current?.contains(target)) close();
    };
    const handleKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, { passive: true });
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("scroll", close);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const position =
    placement === "side"
      ? "sm:absolute sm:left-full sm:bottom-0 sm:ml-4 sm:top-auto sm:translate-x-0 sm:translate-y-0 motion-safe:sm:slide-in-from-left-2"
      : "sm:absolute sm:top-full sm:right-0 sm:left-auto sm:mt-3 sm:translate-x-0 sm:translate-y-0 motion-safe:sm:slide-in-from-top-2";

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="tap w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
        aria-label={dict.header.about}
        aria-expanded={open}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {open &&
        (wide ? (
          <AboutPanel panelRef={panelRef} className={position} onClose={() => setOpen(false)} />
        ) : (
          createPortal(
            <>
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
              <AboutPanel panelRef={panelRef} className="" onClose={() => setOpen(false)} />
            </>,
            document.body,
          )
        ))}
    </div>
  );
}

interface AboutPanelProps {
  panelRef: React.RefObject<HTMLDivElement | null>;
  className: string;
  onClose: () => void;
}

function AboutPanel({ panelRef, className, onClose }: AboutPanelProps) {
  const { dict } = useLanguage();
  return (
    <div
      ref={panelRef}
      className={`glass-chrome fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm max-h-[85dvh] overflow-y-auto overscroll-contain sm:max-h-none sm:overflow-visible sm:w-80 rounded-2xl p-5 z-50 text-left animate-in fade-in motion-safe:zoom-in-95 sm:zoom-in-100 duration-200 ${className}`}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-bold uppercase tracking-wider text-sm">{dict.about.title}</h3>
        <button
          type="button"
          onClick={onClose}
          aria-label={dict.common.close}
          className="tap text-muted hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <p className="text-zinc-300 text-xs leading-relaxed mb-4">
        {dict.about.desc1}
        <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 font-bold transition-colors">
          Gabriel Pimentel
        </a>
        {dict.about.desc2}
      </p>
      <span className="text-[10px] text-muted font-bold uppercase tracking-widest">{dict.about.tech}</span>
      <div className="flex flex-wrap gap-2 mt-2">
        {TECH.map((tech) => (
          <span key={tech} className="text-[11px] font-mono font-bold text-white bg-white/5 border border-white/10 px-2 py-1 rounded">
            {tech}
          </span>
        ))}
      </div>
      {/* Atalhos para as páginas que não cabem nas abas: perguntas, sobre/contato, sugestão e instalar */}
      <ul className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-3">
        <li>
          <Link href="/perguntas" onClick={onClose} className={ROW}>
            <RowIcon d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 2.5-3 4.5M12 17.5h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            <span className="flex-1">{dict.about.faq}</span>
            <Chevron />
          </Link>
        </li>
        <li>
          <Link href="/sobre" onClick={onClose} className={ROW}>
            <RowIcon d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.1a7.5 7.5 0 0 1 15 0" />
            <span className="flex-1">{dict.about.aboutContact}</span>
            <Chevron />
          </Link>
        </li>
        <li>
          <a href={mailto(dict.about.suggestSubject)} className={ROW}>
            <RowIcon d="M3.75 6.75h16.5v10.5H3.75zM3.75 7.5 12 13l8.25-5.5" />
            <span className="flex-1">{dict.about.suggest}</span>
            <Chevron />
          </a>
        </li>
        <InstallRow className={ROW} onDone={onClose} />
      </ul>
    </div>
  );
}

// Linha do menu Sobre: ícone vermelho, texto e seta
const ROW =
  "tap flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-[13px] font-semibold text-zinc-200 transition-colors duration-150 hover:bg-white/5 hover:text-white";

function RowIcon({ d }: { d: string }) {
  return (
    <svg className="h-4.5 w-4.5 shrink-0 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Chevron() {
  return (
    <svg className="h-4 w-4 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/** Chave PT/EN com as bandeiras. */
export function LanguageToggle() {
  const { lang, toggleLang, dict } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={`${lang.toUpperCase()} – ${dict.header.changeLanguage}`}
      className="tap relative w-18 h-7 rounded-full cursor-pointer shrink-0"
    >
      <div className="absolute inset-0 rounded-full overflow-hidden border border-white/10 bg-zinc-950 shadow-[inset_0_4px_10px_rgba(0,0,0,1)]">
        <div className={`absolute top-0 bottom-0 left-0 w-12 transition-transform duration-300 ease-fluid ${lang === "pt" ? "translate-x-0" : "-translate-x-full"}`}>
          <Image src="https://flagcdn.com/w80/br.png" alt="" fill sizes="48px" className="object-cover object-center opacity-85" />
          <div className="absolute inset-0 shadow-[inset_0_0_16px_rgba(0,0,0,1)]" />
        </div>
        <div className={`absolute top-0 bottom-0 right-0 w-12 transition-transform duration-300 ease-fluid ${lang === "en" ? "translate-x-0" : "translate-x-full"}`}>
          <Image src="https://flagcdn.com/w80/us.png" alt="" fill sizes="48px" className="object-cover object-left opacity-85" />
          <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,1)]" />
        </div>
      </div>
      <div className={`absolute top-1/2 -translate-y-1/2 -left-0.5 w-9 h-9 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.6)] transition-transform duration-300 ease-fluid z-10 ${lang === "pt" ? "translate-x-9" : "translate-x-0"}`}>
        <div className="absolute inset-0 rounded-full border border-zinc-400 bg-linear-to-br from-zinc-200 to-zinc-400" />
        <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-zinc-800 tracking-tighter">{lang.toUpperCase()}</div>
      </div>
    </button>
  );
}
