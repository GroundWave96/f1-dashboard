"use client";

import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";
import { AUTHOR_URL, CONTACT_EMAIL, mailto } from "../../lib/site";
import SectionHeader from "../ui/SectionHeader";

const TECH = ["Next.js", "React", "TypeScript", "Tailwind CSS", "Cloudflare Pages", "Cloudflare D1", "Cloudflare Workers"];

const ICONS = {
  person: "M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0zM4.5 20.1a7.5 7.5 0 0 1 15 0",
  mail: "M3.75 6.75h16.5v10.5H3.75zM3.75 7.5 12 13l8.25-5.5",
  data: "M12 3c4.6 0 8.25 1.3 8.25 3s-3.65 3-8.25 3-8.25-1.3-8.25-3S7.4 3 12 3zM3.75 6v12c0 1.7 3.65 3 8.25 3s8.25-1.3 8.25-3V6M3.75 12c0 1.7 3.65 3 8.25 3s8.25-1.3 8.25-3",
  alert: "M12 8v5M12 16.5h.01M10.3 3.9 2.6 17.3A2 2 0 0 0 4.3 20.3h15.4a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
  lock: "M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3M5.25 10.5h13.5v9.75H5.25z",
  code: "m8.25 7.5-4.5 4.5 4.5 4.5M15.75 7.5l4.5 4.5-4.5 4.5",
};

/** Sobre e contato: quem fez, contato, fontes dos dados, aviso de marca, privacidade e tecnologias. */
export default function AboutPage() {
  const { dict } = useLanguage();
  const t = dict.aboutPage;
  const button =
    "tap inline-flex items-center gap-2 self-start rounded-full px-4 py-2.5 text-xs font-bold uppercase tracking-wide transition-[background-color,scale] duration-150 active:scale-[0.96]";

  return (
    <div className="shell flex flex-col gap-6 py-4 sm:py-8">
      <div className="flex flex-col gap-3">
        <SectionHeader as="h1" eyebrow={t.eyebrow} title={t.title} />
        <p className="reveal max-w-3xl text-sm leading-relaxed text-zinc-300 text-pretty sm:text-[15px]" style={{ "--i": 1 } as React.CSSProperties}>
          {t.intro}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card icon={ICONS.person} title={t.whoTitle} index={2}>
          <p>{t.who}</p>
          <a href={AUTHOR_URL} target="_blank" rel="noopener noreferrer" className={`${button} border border-white/10 bg-white/[0.04] text-white hover:bg-white/10`}>
            {t.portfolio}
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M7 17 17 7M9 7h8v8" />
            </svg>
          </a>
        </Card>

        <Card icon={ICONS.mail} title={t.contactTitle} index={3}>
          <p>{t.contact}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a href={mailto(dict.about.suggestSubject)} className={`${button} bg-red-600 text-white hover:bg-red-500`}>
              {t.email}
            </a>
            <span className="select-all font-mono text-xs text-zinc-400">{CONTACT_EMAIL}</span>
          </div>
        </Card>

        <Card icon={ICONS.data} title={t.dataTitle} index={4} className="md:row-span-2">
          <ul className="flex flex-col gap-3">
            {t.sources.map((source) => (
              <li key={source.name} className="flex flex-col">
                <a href={source.url} target="_blank" rel="noopener noreferrer" className="self-start font-semibold text-white underline decoration-white/25 underline-offset-4 transition-colors hover:decoration-red-400">
                  {source.name}
                </a>
                <span>{source.text}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card icon={ICONS.alert} title={t.disclaimerTitle} index={5}>
          <p>{t.disclaimer}</p>
        </Card>

        <Card icon={ICONS.lock} title={t.privacyTitle} index={6}>
          <p>{t.privacy}</p>
        </Card>

        <Card icon={ICONS.code} title={t.techTitle} index={7} className="md:col-span-2">
          <ul className="flex flex-wrap gap-2">
            {TECH.map((tech) => (
              <li key={tech} className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-[11px] font-bold text-white">
                {tech}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Card({ icon, title, index, className = "", children }: { icon: string; title: string; index: number; className?: string; children: React.ReactNode }) {
  return (
    <section className={`reveal glass flex flex-col gap-3 rounded-3xl p-5 text-sm leading-relaxed text-zinc-300 text-pretty sm:p-6 ${className}`} style={{ "--i": index } as React.CSSProperties}>
      <h2 className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-widest text-red-500">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/10 text-red-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <path d={icon} />
          </svg>
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
