"use client";

import React, { useEffect, useState } from "react";
import StartingLight from "./StartingLight";

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [lightsOn, setLightsOn] = useState(0);
  const [phase, setPhase] = useState<"lights" | "go" | "done">("lights");

  // FASE 1: Acender as luzes + Suspense Rápido
  useEffect(() => {
    if (phase !== "lights") return;

    let count = 0;
    const lightInterval = setInterval(() => {
      count++;
      if (count <= 5) {
        setLightsOn(count);
      } else {
        clearInterval(lightInterval);
        
        // SUSPENSE AJUSTADO: Entre 0.4s e 0.9s (Rápido e impactante)
        const suspenseTime = 400 + Math.random() * 500;
        
        setTimeout(() => {
          setPhase("go");
          setLightsOn(0); // Apaga as luzes
        }, suspenseTime);
      }
    }, 500); 

    return () => clearInterval(lightInterval);
  }, [phase]);

  // FASE 2: Espera rápida para o fade-out após apagar as luzes
  useEffect(() => {
    if (phase === "go") {
      const timeout = setTimeout(() => setPhase("done"), 600);
      return () => clearTimeout(timeout);
    }
  }, [phase]);

  // FASE 3: Encerramento do Preloader
  useEffect(() => {
    if (phase === "done") {
      const timeout = setTimeout(() => {
        onComplete();
      }, 500); // Tempo igual ao duration-500 da transição do Tailwind
      return () => clearTimeout(timeout);
    }
  }, [phase, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-100 flex items-center justify-center bg-zinc-950 transition-opacity duration-500 ease-in-out ${
        phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <div 
        // CORREÇÃO DO BUG: O farol fica invisível tanto na fase "go" quanto na fase "done" (phase !== "lights")
        className={`flex w-[90%] max-w-5xl justify-between items-center transition-all duration-300 ${
          phase !== "lights" ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
      >
        <div className="w-[16%]"><StartingLight isOn={lightsOn >= 1} /></div>
        <div className="w-[16%]"><StartingLight isOn={lightsOn >= 2} /></div>
        <div className="w-[16%]"><StartingLight isOn={lightsOn >= 3} /></div>
        <div className="w-[16%]"><StartingLight isOn={lightsOn >= 4} /></div>
        <div className="w-[16%]"><StartingLight isOn={lightsOn >= 5} /></div>
      </div>

      {/* Micro "flash" cinético da largada */}
      <div 
        className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 ${
          phase === "go" ? "opacity-5" : "opacity-0"
        }`}
      />
    </div>
  );
}