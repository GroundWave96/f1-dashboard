"use client";

import React from "react";
import { useAsyncData } from "../../../lib/hooks";
import { loadTrackPath } from "../../../lib/circuit";

interface TrackOutlineProps {
  circuitId: string;
  className?: string;
}

/** Traçado do circuito em linha fina (cor = currentColor), usado nos cards do calendário. Sem o SVG, não mostra nada. */
export default function TrackOutline({ circuitId, className = "" }: TrackOutlineProps) {
  const { data: path } = useAsyncData(`track:${circuitId}`, () => loadTrackPath(circuitId));
  if (!path) return null;

  return (
    <svg viewBox="-15 -15 530 530" className={className} aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
