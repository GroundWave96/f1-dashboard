"use client";

import React from "react";
import { createPortal } from "react-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import { install, setIosHelp, useInstallMode, useIosHelpOpen } from "../../lib/install";
import { useDialog } from "../../lib/hooks";

/** Seta para baixo entrando na bandeja: o símbolo universal de "baixar/instalar". */
export function InstallIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3.75v10.5m0 0 4-4m-4 4-4-4M4.5 14.5v3.25A2.25 2.25 0 0 0 6.75 20h10.5a2.25 2.25 0 0 0 2.25-2.25V14.5" />
    </svg>
  );
}

/** Botão só com o ícone (barra de cima no celular, barra lateral no computador). Some quando não dá para instalar. */
export function InstallButton() {
  const { dict } = useLanguage();
  const mode = useInstallMode();
  if (mode === "none") return null;
  return (
    <button
        type="button"
        onClick={install}
        aria-label={dict.header.install}
        title={dict.header.install}
        className="tap w-9 h-9 shrink-0 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
      >
        <InstallIcon />
      </button>
  );
}

/** Linha "Instalar o app" do menu Sobre. */
export function InstallRow({ className, onDone }: { className: string; onDone?: () => void }) {
  const { dict } = useLanguage();
  const mode = useInstallMode();
  if (mode === "none") return null;
  return (
    <li>
      <button
        type="button"
        onClick={() => {
          // Fecha o menu e instala (ou abre as instruções, que ficam fora do menu)
          onDone?.();
          install();
        }}
        className={className}
      >
        <InstallIcon className="h-4.5 w-4.5 shrink-0 text-red-400" />
        <span className="flex-1 text-left">{dict.about.install}</span>
      </button>
    </li>
  );
}

/** Lugar único das instruções do iPhone (no casco do app). */
export function InstallHelpHost() {
  const open = useIosHelpOpen();
  return open ? <IosInstallSheet onClose={() => setIosHelp(false)} /> : null;
}

/** Texto com **negrito** marcado por asteriscos (passos do iPhone). */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  );
}

/** Instruções do iPhone/iPad: o Safari não deixa o site pedir a instalação. */
function IosInstallSheet({ onClose }: { onClose: () => void }) {
  const { dict } = useLanguage();
  const t = dict.install;
  useDialog(onClose);

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 pb-[max(1rem,env(safe-area-inset-bottom))] font-sans text-white" role="dialog" aria-modal="true" aria-labelledby="install-title">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="glass-chrome relative w-full max-w-sm rounded-3xl p-5 animate-in fade-in motion-safe:slide-in-from-bottom-4 duration-200">
        <h2 id="install-title" className="flex items-center gap-2.5 text-sm font-bold uppercase tracking-wider">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/15 text-red-400">
            <InstallIcon />
          </span>
          {t.iosTitle}
        </h2>
        <ol className="mt-4 flex flex-col gap-3">
          {t.iosSteps.map((step, index) => (
            <li key={index} className="grid grid-cols-[1.75rem_minmax(0,1fr)] items-start gap-2.5 text-sm leading-relaxed text-zinc-300">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/15 font-mono text-xs font-bold text-white">{index + 1}</span>
              <span className="pt-0.5 text-pretty">
                <Rich text={step} />
              </span>
            </li>
          ))}
        </ol>
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="tap mt-5 w-full rounded-full bg-red-600 px-4 py-3 text-sm font-bold text-white transition-[background-color,scale] duration-150 hover:bg-red-500 active:scale-[0.96]"
        >
          {t.gotIt}
        </button>
      </div>
    </div>,
    document.body,
  );
}
