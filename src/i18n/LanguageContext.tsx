"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { dictionaries, Language } from "./dictionaries";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  dict: typeof dictionaries.pt;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("pt");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedLang = localStorage.getItem("f1dash-lang") as Language;
    if (savedLang === "pt" || savedLang === "en") {
      setLang(savedLang);
    }
  }, []);

  const toggleLang = () => {
    if (isTransitioning) return; 
    
    setIsTransitioning(true);

    setTimeout(() => {
      setLang((prev) => {
        const newLang = prev === "pt" ? "en" : "pt";
        localStorage.setItem("f1dash-lang", newLang);
        return newLang;
      }); 
      
      setIsTransitioning(false); 
    }, 300);
  };

  const dict = dictionaries[lang];

  if (!isMounted) return null;

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, dict }}>
      <div 
        className={`transition-opacity duration-300 ease-in-out h-full w-full ${
          isTransitioning ? "opacity-0" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage deve ser usado dentro de um LanguageProvider");
  }
  return context;
}