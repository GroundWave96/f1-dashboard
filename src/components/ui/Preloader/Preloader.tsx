"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import StartingLight from "./StartingLight";

interface PreloaderProps {
  // A abertura começou a sair: o app já pode iniciar as animações de entrada (as duas coisas se sobrepõem)
  onReveal: () => void;
  // A abertura terminou de sair e pode ser removida
  onDone: () => void;
  // Visitas seguintes na mesma sessão ou "reduzir movimento": só um esmaecer rápido
  quick?: boolean;
}

type Phase = "lights" | "out" | "brand" | "exit";

const LIGHT_STEP = 250;
const STREAK = 420;
const BRAND_HOLD = 350;
const EXIT = 450;

/**
 * Abertura: as cinco luzes da largada acendem, apagam juntas (com um suspense aleatório, como na
 * F1 de verdade) e um rastro de luz cruza a tela revelando a marca; depois tudo se dissolve enquanto
 * o app entra. Um toque ou tecla pula direto para o fim.
 */
export default function Preloader({ onReveal, onDone, quick = false }: PreloaderProps) {
  const [lit, setLit] = useState(0);
  const [phase, setPhase] = useState<Phase>(quick ? "exit" : "lights");
  const timers = useRef<number[]>([]);
  const exiting = useRef(false);
  const callbacks = useRef({ onReveal, onDone });

  useEffect(() => {
    callbacks.current = { onReveal, onDone };
  });

  useEffect(() => {
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const exit = () => {
      if (exiting.current) return;
      exiting.current = true;
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setPhase("exit");
      callbacks.current.onReveal();
      at(quick ? 250 : EXIT, () => callbacks.current.onDone());
    };

    if (quick) {
      exit();
      return () => timers.current.forEach(clearTimeout);
    }

    for (let i = 1; i <= 5; i++) at(i * LIGHT_STEP, () => setLit(i));
    const lightsOut = 5 * LIGHT_STEP + 250 + Math.random() * 300;
    at(lightsOut, () => {
      setLit(0);
      setPhase("out");
    });
    at(lightsOut + STREAK, () => setPhase("brand"));
    at(lightsOut + STREAK + BRAND_HOLD, exit);

    // Interromper a qualquer momento: toque, clique ou tecla
    window.addEventListener("pointerdown", exit);
    window.addEventListener("keydown", exit);
    return () => {
      timers.current.forEach(clearTimeout);
      window.removeEventListener("pointerdown", exit);
      window.removeEventListener("keydown", exit);
    };
  }, [quick]);

  const showLights = phase === "lights";
  const showBrand = phase === "out" || phase === "brand" || (phase === "exit" && !quick);

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#060607] transition-opacity ease-fluid ${phase === "exit" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
      style={{ transitionDuration: `${quick ? 250 : EXIT}ms` }}
    >
      {/* Brilho vermelho que cresce a cada luz acesa e some de uma vez na largada */}
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{ opacity: lit * 0.18, background: "radial-gradient(60% 45% at 50% 50%, rgb(225 6 0 / 0.55), transparent 70%)" }}
      />

      <div className={`relative flex w-[min(88vw,46rem)] items-center justify-between gap-[2%] rounded-[2rem] border border-white/5 bg-black/60 px-[3%] py-[2.5%] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] transition-[opacity,scale] duration-200 ${showLights ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="w-[17%]">
            <StartingLight isOn={lit >= n} />
          </div>
        ))}
      </div>

      {phase !== "lights" && !quick && (
        <>
          {/* Rastro de luz: um carro passando em alta velocidade */}
          <span className="intro-streak absolute left-0 top-1/2 h-[3px] w-[45vw]" style={{ animationDuration: `${STREAK}ms` }} />
          <span className="intro-streak intro-streak-glow absolute left-0 top-1/2 h-10 w-[45vw]" style={{ animationDuration: `${STREAK}ms` }} />
        </>
      )}

      {showBrand && (
        <div className={`intro-brand absolute flex flex-col items-center gap-4 transition-[scale,filter] ease-fluid ${phase === "exit" ? "scale-[1.04] blur-[2px]" : ""}`} style={{ transitionDuration: `${EXIT}ms` }}>
          <Image src="/teams/f1.svg" alt="" width={192} height={48} className="w-[min(46vw,13rem)] h-auto" priority />
          <span className="text-[min(4.2vw,1.35rem)] font-black uppercase tracking-[0.55em] pl-[0.55em] text-white">Dashboard</span>
          <span className="h-[2px] w-24 rounded-full bg-linear-to-r from-transparent via-red-500 to-transparent" />
        </div>
      )}
    </div>
  );
}
