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
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <span className="flex items-center gap-2">
            <h3 className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-[11px]">{title}</h3>
            <button
              type="button"
              onClick={() => setShowInfo((value) => !value)}
              aria-expanded={showInfo}
              aria-controls={infoId}
              aria-label={`${dict.session.info} ${title}`}
              className={`tap -my-1 flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-150 ${showInfo ? "border-white/25 bg-white/10 text-white" : "border-white/10 text-muted hover:text-white hover:bg-white/5"}`}
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M12 11v6M12 7.5h.01" />
              </svg>
            </button>
          </span>
          {actions}
        </div>
        {summary && <p className="text-sm sm:text-[15px] font-semibold leading-snug text-white text-pretty">{summary}</p>}
        {showInfo && (
          <p id={infoId} className="swap-in rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-xs leading-relaxed text-zinc-300 text-pretty">
            {info}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}
