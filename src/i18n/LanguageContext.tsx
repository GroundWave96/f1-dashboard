"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useSyncExternalStore, ReactNode } from "react";
import { dictionaries, Language } from "./dictionaries";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  dict: typeof dictionaries.pt;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "f1dash-lang";

function getSavedLang(): Language {
  try {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang === "pt" || savedLang === "en") return savedLang;
  } catch {
    // localStorage indisponível (ex.: navegação privada)
  }
  return "pt";
}

const noopSubscribe = () => () => {};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // No servidor renderiza null; no cliente só renderiza após a hidratação, evitando mismatch de idioma
  const isMounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [lang, setLang] = useState<Language>(() => (typeof window === "undefined" ? "pt" : getSavedLang()));
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  useEffect(() => {
    return () => {
      if (transitionTimer.current) clearTimeout(transitionTimer.current);
    };
  }, []);

  const toggleLang = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    transitionTimer.current = setTimeout(() => {
      const newLang = lang === "pt" ? "en" : "pt";
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        // localStorage indisponível (ex.: navegação privada)
      }
      setLang(newLang);
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