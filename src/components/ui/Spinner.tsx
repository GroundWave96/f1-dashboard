import React from "react";

interface SpinnerProps {
  className?: string;
}

export default function Spinner({ className = "" }: SpinnerProps) {
  return (
    <div 
      className={`w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin ${className}`}
    ></div>
  );
}