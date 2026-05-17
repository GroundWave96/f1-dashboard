import React from "react";

interface StartingLightProps {
    isOn: boolean;
}

export default function StartingLight({ isOn }: StartingLightProps) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 100"
            className="w-full aspect-square drop-shadow-2xl"
        >
            <defs>
                <linearGradient id="chrome" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#e5e7eb" />
                    <stop offset="25%" stopColor="#9ca3af" />
                    <stop offset="50%" stopColor="#ffffff" />
                    <stop offset="75%" stopColor="#4b5563" />
                    <stop offset="100%" stopColor="#d1d5db" />
                </linearGradient>

                <radialGradient id="lens" cx="50%" cy="50%" r="50%">
                    <stop offset="70%" stopColor="#18181b" />
                    <stop offset="100%" stopColor="#09090b" />
                </radialGradient>
            </defs>

            <circle cx="50" cy="50" r="48" fill="url(#chrome)" stroke="#1f2937" strokeWidth="1" />
            <circle cx="50" cy="50" r="42" fill="url(#lens)" stroke="#000" strokeWidth="2" />

            <circle
                cx="50" cy="50" r="40"
                className={`transition-opacity duration-100 ${isOn ? "opacity-30 fill-red-600" : "opacity-0"}`}
            />

            <g className={`transition-colors duration-100 ${isOn ? "fill-red-500 drop-shadow-[0_0_5px_rgba(239,68,68,1)]" : "fill-zinc-800"}`}>
                <circle cx="50" cy="50" r="3.5" />
                <circle cx="50" cy="36" r="3.5" />
                <circle cx="62.1" cy="43" r="3.5" />
                <circle cx="62.1" cy="57" r="3.5" />
                <circle cx="50" cy="64" r="3.5" />
                <circle cx="37.9" cy="57" r="3.5" />
                <circle cx="37.9" cy="43" r="3.5" />
                <circle cx="50" cy="22" r="3.5" />
                <circle cx="64" cy="25.8" r="3.5" />
                <circle cx="74.2" cy="36" r="3.5" />
                <circle cx="78" cy="50" r="3.5" />
                <circle cx="74.2" cy="64" r="3.5" />
                <circle cx="64" cy="74.2" r="3.5" />
                <circle cx="50" cy="78" r="3.5" />
                <circle cx="36" cy="74.2" r="3.5" />
                <circle cx="25.8" cy="64" r="3.5" />
                <circle cx="22" cy="50" r="3.5" />
                <circle cx="25.8" cy="36" r="3.5" />
                <circle cx="36" cy="25.8" r="3.5" />
            </g>

            <path d="M 15 50 A 35 35 0 0 1 85 50 A 35 15 0 0 0 15 50 Z" fill="#ffffff" opacity="0.15" />
        </svg>
    );
}