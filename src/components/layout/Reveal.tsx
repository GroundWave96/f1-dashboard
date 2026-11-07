"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAppReady } from "./AppShell";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Bloco de página que marca `data-inview="true"` na primeira vez que aparece na tela (depois da abertura),
 * o que dispara as animações `.reveal` / `.rise` / `.grow-x` / `.draw-on-view` definidas em globals.css.
 */
export default function Reveal({ children, className = "" }: RevealProps) {
  const ready = useAppReady();
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
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [ready, seen]);

  return (
    <section ref={ref} data-inview={seen ? "true" : "false"} className={`relative ${className}`}>
      {children}
    </section>
  );
}
