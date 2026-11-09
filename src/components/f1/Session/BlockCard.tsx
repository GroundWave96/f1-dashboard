"use client";

import React, { useId, useState } from "react";
import { useLanguage } from "../../../i18n/LanguageContext";

interface BlockCardProps {
  title: string;
  // Frase de resumo em português comum: quem é novo lê só ela; quem é experiente vai ao gráfico
  summary?: React.ReactNode;
  // Explicação aberta pelo ⓘ
  info: string;
  // Controles à direita do título (filtros, seletores)
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

/**
 * Cartão padrão dos blocos da página Sessão: título, resumo, explicação opcional (ⓘ) e o conteúdo.
 * A explicação abre logo abaixo do título, dentro do cartão: nada flutua nem sai da tela no celular.
 */
export default function BlockCard({ title, summary, info, actions, className = "", style, children }: BlockCardProps) {
  const { dict } = useLanguage();
  const [showInfo, setShowInfo] = useState(false);
  const infoId = useId();

  return (
    <div className={`@container glass rounded-3xl p-4 sm:p-5 flex flex-col gap-4 min-w-0 ${className}`} style={style}>
      <div className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="flex items-center gap-2.5">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-[11px]">{title}</h3>
            {/* Mesmo ícone e acabamento do botão "Sobre" do cabeçalho; a área de toque passa do círculo (after:) */}
            <button
              type="button"
              onClick={() => setShowInfo((value) => !value)}
              aria-expanded={showInfo}
              aria-controls={infoId}
              aria-label={`${dict.session.info} ${title}`}
              className={`tap relative -my-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors duration-150 after:absolute after:-inset-1.5 after:content-[''] ${showInfo ? "border-white/25 bg-white/15 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white"}`}
            >
              <svg className="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </span>
          {actions}
        </div>
        {summary && <p className="mt-2 text-sm sm:text-[15px] font-semibold leading-snug text-white text-pretty">{summary}</p>}
        {/* A explicação cresce para baixo (0fr → 1fr) em 200 ms e recolhe do mesmo jeito; fechada, fica fora do
            teclado e do leitor de tela. Com "reduzir movimento", só aparece e some */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none ${showInfo ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
          inert={!showInfo}
          aria-hidden={!showInfo}
        >
          <div className="min-h-0 overflow-hidden">
            <p
              id={infoId}
              className={`mt-2.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-zinc-300 text-pretty transition-transform duration-200 ease-out motion-reduce:transition-none ${showInfo ? "translate-y-0" : "-translate-y-1.5"}`}
            >
              {info}
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
