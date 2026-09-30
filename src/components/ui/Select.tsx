"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  align?: "left" | "right";
}

export default function Select({ value, options, onChange, ariaLabel, align = "left" }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const listId = useId();

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selected = options[selectedIndex];

  const open = () => {
    setActiveIndex(Math.max(selectedIndex, 0));
    setIsOpen(true);
  };

  const close = (focusButton = false) => {
    setIsOpen(false);
    if (focusButton) buttonRef.current?.focus();
  };

  const selectIndex = (index: number) => {
    onChange(options[index].value);
    close(true);
  };

  // Move o destaque via teclado mantendo o item visível dentro da lista
  const moveActive = (index: number) => {
    const next = Math.min(Math.max(index, 0), options.length - 1);
    setActiveIndex(next);

    const list = listRef.current;
    const item = list?.children[next] as HTMLElement | undefined;
    if (!list || !item) return;
    if (item.offsetTop < list.scrollTop) {
      list.scrollTop = item.offsetTop;
    } else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    // Ao abrir, foca a lista e centraliza a opção selecionada
    const list = listRef.current;
    const item = list?.children[Math.max(selectedIndex, 0)] as HTMLElement | undefined;
    list?.focus();
    if (list && item) {
      list.scrollTop = item.offsetTop - list.clientHeight / 2 + item.offsetHeight / 2;
    }

    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleScroll = () => setIsOpen(false);
    const mainContainer = document.querySelector("main");

    document.addEventListener("mousedown", handleClickOutside);
    mainContainer?.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      mainContainer?.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen, selectedIndex]);

  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      open();
    }
  };

  const handleListKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        moveActive(activeIndex + 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        moveActive(activeIndex - 1);
        break;
      case "Home":
        e.preventDefault();
        moveActive(0);
        break;
      case "End":
        e.preventDefault();
        moveActive(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectIndex(activeIndex);
        break;
      case "Escape":
        e.preventDefault();
        close(true);
        break;
      case "Tab":
        close();
        break;
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listId}
        aria-label={ariaLabel}
        onClick={() => (isOpen ? close() : open())}
        onKeyDown={handleButtonKeyDown}
        className={`flex items-center gap-1.5 bg-zinc-800 text-white text-xs font-bold py-1 pl-3 pr-2 rounded-full border outline-none cursor-pointer transition-colors hover:bg-zinc-700 focus-visible:border-red-500 ${
          isOpen ? "border-red-500" : "border-zinc-700"
        }`}
      >
        <span>{selected?.label}</span>
        <svg
          className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={ariaLabel}
          aria-activedescendant={`${listId}-${activeIndex}`}
          onKeyDown={handleListKeyDown}
          className={`absolute top-full mt-2 z-40 min-w-44 w-max max-h-64 overflow-y-auto overscroll-contain p-1 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl outline-none animate-in fade-in zoom-in-95 slide-in-from-top-1 duration-150 [scrollbar-width:thin] [scrollbar-color:#3f3f46_transparent] ${
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left"
          }`}
        >
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            const isActive = index === activeIndex;

            return (
              <li
                key={option.value}
                id={`${listId}-${index}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectIndex(index)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap cursor-pointer transition-colors ${
                  isActive ? "bg-zinc-800" : ""
                } ${isSelected ? "text-red-500" : isActive ? "text-white" : "text-zinc-400"}`}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
