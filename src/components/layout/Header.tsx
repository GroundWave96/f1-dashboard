"use client";

import React, { useState } from "react";

export default function Header() {
  const [lang, setLang] = useState<"pt" | "en">("pt");

  const toggleLang = () => {
    setLang((prev) => (prev === "pt" ? "en" : "pt"));
  };

  return (
    <header className="w-full max-w-4xl mx-auto flex items-center justify-between shrink-0 p-4 sm:p-0">
        
      <div className="h-5 sm:h-6 flex items-center shrink-0">
        <img 
          src="/teams/f1.svg" 
          alt="F1 Logo" 
          className="h-full w-auto object-contain opacity-90" 
        />
      </div>

      <div className="shrink-0 flex items-center">
        
        <button 
          onClick={toggleLang}
          aria-label="Mudar idioma"
          className="relative w-18 h-7 rounded-full cursor-pointer focus:outline-none"
        >
          <div className="absolute inset-0 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 shadow-[inset_0_4px_10px_rgba(0,0,0,1)]">
            
            <div 
              className={`absolute top-0 bottom-0 left-0 w-12 transition-transform duration-300 ease-in-out ${
                lang === "pt" ? "translate-x-0" : "-translate-x-full"
              }`}
            >
              <img src="https://flagcdn.com/w80/br.png" alt="PT-BR" className="w-full h-full object-cover object-center opacity-85" />
              <div className="absolute inset-0 shadow-[inset_0_0_16px_rgba(0,0,0,1)]" />
            </div>

            <div 
              className={`absolute top-0 bottom-0 right-0 w-12 transition-transform duration-300 ease-in-out ${
                lang === "en" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <img src="https://flagcdn.com/w80/us.png" alt="EN-US" className="w-full h-full object-cover object-left opacity-85" />
              <div className="absolute inset-0 shadow-[inset_0_0_10px_rgba(0,0,0,1)]" />
            </div>

          </div>

          <div 
            className={`absolute top-1/2 -translate-y-1/2 -left-0.5 w-9 h-9 rounded-full shadow-[0_3px_6px_rgba(0,0,0,0.6)] transform transition-transform duration-300 ease-in-out z-10 ${
              lang === "pt" ? "translate-x-9" : "translate-x-0"
            }`}
          >
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