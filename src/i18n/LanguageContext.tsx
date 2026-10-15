"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useSyncExternalStore, ReactNode } from "react";
import { dictionaries, Dictionary, Language } from "./dictionaries";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  dict: Dictionary;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = "f1dash-lang";

// Idioma escolhido nesta aba (vale mesmo se o localStorage estiver bloqueado)
let chosenLang: Language | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

// Preferência salva > idioma do navegador (primeira visita)
function getClientLang(): Language {
  if (chosenLang) return chosenLang;
  try {
    const savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang === "pt" || savedLang === "en") return savedLang;
  } catch {
    // localStorage indisponível (ex.: navegação privada)
  }
  return navigator.language.toLowerCase().startsWith("pt") ? "pt" : "en";
}

// O HTML gerado no servidor sai em português; no navegador o React troca para o idioma do usuário
const getServerLang = (): Language => "pt";

function saveLang(lang: Language) {
  chosenLang = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // localStorage indisponível (ex.: navegação privada)
  }
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const lang = useSyncExternalStore(subscribe, getClientLang, getServerLang);
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
      saveLang(lang === "pt" ? "en" : "pt");
      setIsTransitioning(false);
    }, 300);
  };

  const dict = dictionaries[lang];

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
