"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { dictionaries, Language } from "./dictionaries";

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  dict: typeof dictionaries.pt;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("pt");

  const toggleLang = () => {
    setLang((prev) => (prev === "pt" ? "en" : "pt"));
  };

  const dict = dictionaries[lang];

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, dict }}>
      {children}
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