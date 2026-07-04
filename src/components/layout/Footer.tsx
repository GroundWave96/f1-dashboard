"use client";

import React from "react";
import { useLanguage } from "../../i18n/LanguageContext";

export default function Footer() {
  const { dict } = useLanguage();

  return (
    <footer className="shrink-0 text-center py-4">
      <p className="text-[10px] sm:text-xs text-zinc-500 uppercase tracking-widest font-medium">
        Designed & Developed by{" "}
        <a
          href="https://gabrielpimentel.pages.dev/"
          target="_blank"
          rel="noopener noreferrer"
          className="relative inline-block text-red-500 hover:text-red-400 transition-colors font-bold after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-[1.5px] after:bottom-0 after:left-0 after:bg-red-500 after:origin-bottom-left after:transition-transform after:duration-300 hover:after:scale-x-100"
          title={dict.footer.portfolioTitle}
        >
          Gabriel Pimentel
        </a>
      </p>
    </footer>
  );
}