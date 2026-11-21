"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { useLanguage } from "../../i18n/LanguageContext";
import { mailto } from "../../lib/site";
import SectionHeader from "../ui/SectionHeader";

type FaqItem = { id: string; q: string; a: string; href: string; cta: string };

/**
 * Perguntas frequentes. Computador: à esquerda um cartão fixo (título, introdução e "mande sua
 * pergunta"); à direita as perguntas. Celular: tudo numa coluna. As respostas ficam no HTML mesmo
 * fechadas (o Google lê), mas fora do teclado e do leitor de tela enquanto fechadas.
 */
export default function FaqPage() {
  const { dict } = useLanguage();
  const t = dict.faq;
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="shell flex flex-col gap-6 py-4 sm:py-8 lg:grid lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start lg:gap-8">
      <aside className="flex flex-col gap-5 lg:sticky lg:top-6">
        <SectionHeader as="h1" eyebrow={t.eyebrow} title={t.title} />
        <p className="reveal text-sm leading-relaxed text-zinc-300 text-pretty sm:text-[15px]" style={{ "--i": 1 } as React.CSSProperties}>
          {t.intro}
        </p>
        {/* Sem a animação de entrada (.reveal): neste cartão o Chrome deixa de pintá-lo depois dela */}
        <div className="glass hidden flex-col gap-3 rounded-2xl p-4 lg:flex">
          <AskBlock />
        </div>
      </aside>

      <ul className="flex flex-col gap-2.5">
        {(t.items as FaqItem[]).map((item, index) => (
          <Question key={item.id} item={item} index={index} open={open.has(item.id)} onToggle={() => toggle(item.id)} />
        ))}
        <li className="reveal glass flex flex-col gap-3 rounded-2xl p-4 lg:hidden" style={{ "--i": 8 } as React.CSSProperties}>
          <AskBlock />
        </li>
      </ul>
    </div>
  );
}

function AskBlock() {
  const { dict } = useLanguage();
  return (
    <>
      <span className="text-sm font-semibold text-white">{dict.faq.notFound}</span>
      <a
        href={mailto(dict.about.suggestSubject)}
        className="tap inline-flex items-center justify-center gap-2 self-start rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-[background-color,scale] duration-150 hover:bg-red-500 active:scale-[0.96]"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M3.75 6.75h16.5v10.5H3.75zM3.75 7.5 12 13l8.25-5.5" />
        </svg>
        {dict.faq.ask}
      </a>
    </>
  );
}

function Question({ item, index, open, onToggle }: { item: FaqItem; index: number; open: boolean; onToggle: () => void }) {
  const { dict } = useLanguage();
  const panelId = useId();
  const linkClass =
    "tap inline-flex items-center gap-1.5 self-start rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold uppercase tracking-wide text-white transition-[background-color,scale] duration-150 hover:bg-white/10 active:scale-[0.96]";

  return (
    <li id={item.id} className="reveal glass scroll-mt-24 rounded-2xl" style={{ "--i": Math.min(index, 7) + 1 } as React.CSSProperties}>
      <h2>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="tap flex w-full items-center gap-4 rounded-2xl px-4 py-4 text-left sm:px-5">
          <span className="flex-1 text-[15px] font-semibold leading-snug text-white text-pretty sm:text-base">{item.q}</span>
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-[transform,background-color,border-color] duration-200 ease-out ${open ? "rotate-180 border-white/25 bg-white/10" : "border-white/10"}`}>
            <svg className="h-4 w-4 text-zinc-300" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      </h2>
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        inert={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="flex flex-col gap-3 px-4 pb-4 sm:px-5">
            <p className="text-sm leading-relaxed text-zinc-300 text-pretty">{item.a}</p>
            {item.cta &&
              (item.href === "mailto" ? (
                <a href={mailto(dict.about.suggestSubject)} className={linkClass}>
                  {item.cta}
                  <span aria-hidden="true">→</span>
                </a>
              ) : (
                <Link href={item.href} className={linkClass}>
                  {item.cta}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </li>
  );
}
