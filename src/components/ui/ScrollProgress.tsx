import React from "react";

interface ScrollProgressProps {
  progress: number;
}

export default function ScrollProgress({ progress }: ScrollProgressProps) {
  return (
    <div 
      className="fixed top-0 left-0 h-1.5 w-full bg-red-600 origin-left z-60 shadow-[0_0_10px_rgba(220,38,38,0.8)]"
      style={{ transform: `scaleX(${progress / 100})` }}
    />
  );
}