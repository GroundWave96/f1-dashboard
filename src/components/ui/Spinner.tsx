import React from "react";

interface SpinnerProps {
  className?: string; // Permite adicionar classes extras (como margens) no futuro, se precisar
}

export default function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div 
      className={`w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin ${className}`}
    ></div>
  );
}