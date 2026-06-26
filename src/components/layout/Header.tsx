"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Header() {
  const { lang, toggleLang, dict } = useLanguage();
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  
  const aboutRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isAboutOpen) return;

    const mainContainer = document.querySelector("main");
    
    const handleScroll = () => {
      setIsAboutOpen(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (
        aboutRef.current && 
        !aboutRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsAboutOpen(false);
      }
    };

    if (mainContainer) {
      mainContainer.addEventListener("scroll", handleScroll, { passive: true });
    }
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      if (mainContainer) {
        mainContainer.removeEventListener("scroll", handleScroll);
      }
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isAboutOpen]);

  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 p-4 sm:p-0 relative z-50">
      <div className="h-5 sm:h-6 flex items-center shrink-0">
        <Image
          src="/teams/f1.svg"
          alt="F1 Logo"
          width={96}
          height={24}
          className="h-full w-auto object-contain opacity-90"
          priority
        />
      </div>

      <div className="shrink-0 flex items-center gap-3 sm:gap-4">
        
        <div className="relative">
            <button
              ref={buttonRef}
              onClick={() => setIsAboutOpen(!isAboutOpen)}
              className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 transition-colors focus:outline-none"
              aria-label="Sobre o projeto"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>

            {isAboutOpen && (
              <>
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 sm:hidden" />
                
                <div 
                  ref={aboutRef}
                  className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm sm:absolute sm:top-full sm:left-auto sm:right-0 sm:-translate-x-0 sm:translate-y-0 sm:mt-3 sm:w-80 bg-zinc-900 border border-zinc-700 shadow-2xl rounded-xl p-5 z-50 animate-in fade-in zoom-in-95 sm:slide-in-from-top-2 sm:zoom-in-100 duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-white font-bold uppercase tracking-wider text-sm">
                        {dict.about?.title || "Sobre o Projeto"}
                    </h3>
                    <button onClick={() => setIsAboutOpen(false)} className="text-zinc-500 hover:text-white hover:bg-zinc-800 p-1 rounded-full transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                  
                  <p className="text-zinc-400 text-xs leading-relaxed mb-4">
                    {dict.about?.desc1 || "Desenvolvido por "}
                    <a 
                      href="https://gabrielpimentel.vercel.app/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-red-500 hover:text-red-400 font-bold transition-colors"
                    >
                      Gabriel Pimentel
                    </a>
                    {dict.about?.desc2 || " como um projeto de estudo e portfólio..."}
                  </p>
                  
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                        {dict.about?.tech || "Tecnologias"}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[11px] font-mono font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-1 rounded">Next.js</span>
                      <span className="text-[11px] font-mono font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-1 rounded">React</span>
                      <span className="text-[11px] font-mono font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-1 rounded">TypeScript</span>
                      <span className="text-[11px] font-mono font-bold text-white bg-zinc-800 border border-zinc-700 px-2 py-1 rounded">Tailwind CSS</span>
                    </div>
                  </div>
                </div>
              </>
            )}
        </div>

        <button
          onClick={toggleLang}
          aria-label="Mudar idioma"
          className="relative w-18 h-7 rounded-full cursor-pointer focus:outline-none"
        >
          <div className="absolute inset-0 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 shadow-[inset_0_4px_10px_rgba(0,0,0,1)]">
            <div className={`absolute top-0 bottom-0 left-0 w-12 transition-transform duration-300 ease-in-out ${lang === "pt" ? "translate-x-0" : "-translate-x-full"}`}>
              <Image src="https://flagcdn.com/w80/br.png" alt="PT-BR" fill sizes="48px" className="object-cover object-center opacity-85" />
              <div className="absolute inset-0 shadow-[inset_0_0_16px_rgba(0,0,0,1)]" />
            </div>
            <div className={`absolute top-0 bottom-0 right-0 w-12 transition-transform duration-300 ease-in-out ${lang === "en" ? "translate-x-0" : "translate-x-full"}`}>
              <Image src="https://flagcdn.com/w80/us.png" alt="EN-US" fill sizes="48px" className="object-cover object-left opacity-85" />
              <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,1)]" />
            </div>
          </div>
          <div className={`absolute top-1/2 -translate-y-1/2 -left-0.5 w-9 h-9 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-in-out z-10 ${lang === "pt" ? "translate-x-9" : "translate-x-0"}`}>
            <div className="absolute inset-0 rounded-full border border-zinc-400 bg-linear-to-br from-zinc-200 to-zinc-400" />
            <div className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-zinc-800 tracking-tighter">
              {lang.toUpperCase()}
            </div>
          </div>
        </button>
      </div>
    </header>
  );
}