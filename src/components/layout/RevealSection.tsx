"use client";

import React, { useEffect, useRef, useState } from "react";

interface RevealSectionProps {
  children: React.ReactNode;
  // Só observa depois do preloader, para a animação de entrada acontecer à vista do usuário
  ready: boolean;
}

/**
 * Seção de tela inteira. Marca `data-inview="true"` na primeira vez que ela aparece,
 * o que dispara as animações `.reveal` / `.rise` / `.grow-x` definidas em globals.css.
 */
export default function RevealSection({ children, ready }: RevealSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!ready || seen || !element) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ready, seen]);

  return (
    <section ref={ref} data-inview={seen ? "true" : "false"} className="h-dvh w-full snap-start relative overflow-hidden">
      {children}
    </section>
  );
}
