"use client";

import React, { useRef, useState } from "react";

interface CardDeckProps {
  children: React.ReactNode[];
  // Nome de cada card, usado nos pontinhos de navegação (acessibilidade)
  labels: string[];
}

/**
 * Cards lado a lado. No celular vira um carrossel com "espiada" do próximo card e pontinhos;
 * em telas maiores vira grade (regras em .deck no globals.css). Assim nada precisa de rolagem vertical.
 */
export default function CardDeck({ children, labels }: CardDeckProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const handleScroll = () => {
    const deck = ref.current;
    const first = deck?.children[0] as HTMLElement | undefined;
    if (!deck || !first) return;
    const step = first.offsetWidth + 12;
    setActive(Math.min(children.length - 1, Math.round(deck.scrollLeft / step)));
  };

  const goTo = (index: number) => {
    const card = ref.current?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div ref={ref} onScroll={handleScroll} className="deck flex-1 min-h-0">
        {children.map((child, index) => (
          <div key={labels[index]} className="reveal min-w-0" style={{ "--i": index + 1 } as React.CSSProperties}>
            {child}
          </div>
        ))}
      </div>
      <div className="deck-dots justify-center shrink-0">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            aria-current={active === index ? "true" : undefined}
            aria-label={label}
            onClick={() => goTo(index)}
            className="flex h-6 items-center px-2"
          >
            <span className={`block h-2 rounded-full transition-[width,background-color] duration-300 ease-fluid ${active === index ? "w-6 bg-red-500" : "w-2 bg-zinc-600"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
