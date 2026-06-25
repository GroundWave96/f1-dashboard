"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function SideNavigation() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0); // Estado fluido para a barra vermelha
  
  const { dict } = useLanguage();

  const sectionsList = [
    dict.nextRace?.title || "Próxima Corrida",
    dict.standings?.title || "Classificação",
    dict.calendar?.title || "Calendário",
    dict.results?.title || "Resultados",
  ];

  useEffect(() => {
    // Pegamos exatamente o container que tem o scroll ativo
    const mainContainer = document.querySelector("main");
    if (!mainContainer) return;

    const handleScroll = () => {
      const scrollTop = mainContainer.scrollTop;
      const scrollHeight = mainContainer.scrollHeight - mainContainer.clientHeight;
      
      // 1. Calcula a porcentagem exata do scroll para a Barra Vermelha
      const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
      setScrollProgress(progress);

      // 2. Calcula qual seção está mais visível para acender a bolinha correta instantaneamente
      const sectionHeight = mainContainer.clientHeight;
      const currentIndex = Math.round(scrollTop / sectionHeight);
      
      setActiveIndex(currentIndex);
    };

    // Roda uma vez para inicializar a barra em 0%
    handleScroll();

    // Adiciona o leitor de scroll contínuo
    mainContainer.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      mainContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (index: number) => {
    const sections = document.querySelectorAll("main > section");
    if (sections[index]) {
      sections[index].scrollIntoView({ behavior: "smooth" });
    }
    setHoveredIndex(null); // Esconde o texto no momento exato do clique
  };

  return (
    <>
      {/* A Nova Barra Vermelha Superior Fluida */}
      <div 
        className="fixed top-0 left-0 h-1 bg-red-600 z-[100] drop-shadow-[0_0_8px_rgba(220,38,38,0.8)]"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* A Navegação Lateral (Bolinhas) */}
      <div className="hidden lg:flex fixed right-6 top-1/2 -translate-y-1/2 flex-col gap-4 z-50">
        {sectionsList.map((label, index) => (
          <div 
            key={index} 
            className="relative flex items-center justify-end h-8 cursor-pointer"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => scrollToSection(index)}
          >
            <span 
              className={`absolute right-8 text-[10px] font-bold text-white uppercase tracking-widest bg-zinc-900 px-3 py-1.5 rounded border border-zinc-800 pointer-events-none whitespace-nowrap shadow-lg transition-all duration-200 ${
                hoveredIndex === index 
                  ? "opacity-100 translate-x-0" 
                  : "opacity-0 translate-x-2"
              }`}
            >
              {label}
            </span>
            
            <div className="w-6 h-6 flex items-center justify-center">
              <div
                  className={`transition-all duration-300 rounded-full ${
                  activeIndex === index 
                      ? "w-2.5 h-2.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" 
                      : hoveredIndex === index
                          ? "w-2.5 h-2.5 bg-zinc-400"
                          : "w-1.5 h-1.5 bg-zinc-600"
                  }`}
              />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}