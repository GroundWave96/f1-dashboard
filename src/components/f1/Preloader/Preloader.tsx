"use client";

import React, { useEffect, useState } from "react";
import StartingLight from "./StartingLight";

interface PreloaderProps {
    onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
    const [lightsOn, setLightsOn] = useState(0);
    const [phase, setPhase] = useState<"lights" | "go" | "done">("lights");

    useEffect(() => {
        if (phase !== "lights") return;

        let count = 0;
        const lightInterval = setInterval(() => {
            count++;
            if (count <= 5) {
                setLightsOn(count);
            } else {
                clearInterval(lightInterval);

                const suspenseTime = 400 + Math.random() * 500;

                setTimeout(() => {
                    setLightsOn(0);
                    setTimeout(() => {
                        setPhase("go");
                    }, 350);

                }, suspenseTime);
            }
        }, 400);

        return () => clearInterval(lightInterval);
    }, [phase]);

    useEffect(() => {
        if (phase === "go") {
            const timeout = setTimeout(() => setPhase("done"), 10);
            return () => clearTimeout(timeout);
        }
    }, [phase]);

    useEffect(() => {
        if (phase === "done") {
            const timeout = setTimeout(() => {
                onComplete();
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [phase, onComplete]);

    return (
        <div
            className={`fixed inset-0 z-100 flex items-center justify-center bg-zinc-950 transition-opacity duration-500 ease-in-out ${phase === "done" ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
        >
            <div
                className={`flex w-[90%] max-w-5xl justify-between items-center transition-all duration-300 ${phase !== "lights" ? "opacity-0 scale-95" : "opacity-100 scale-100"
                    }`}
            >
                <div className="w-[16%]"><StartingLight isOn={lightsOn >= 1} /></div>
                <div className="w-[16%]"><StartingLight isOn={lightsOn >= 2} /></div>
                <div className="w-[16%]"><StartingLight isOn={lightsOn >= 3} /></div>
                <div className="w-[16%]"><StartingLight isOn={lightsOn >= 4} /></div>
                <div className="w-[16%]"><StartingLight isOn={lightsOn >= 5} /></div>
            </div>

            <div
                className={`absolute inset-0 bg-white pointer-events-none transition-opacity duration-300 ${phase === "go" ? "opacity-5" : "opacity-0"
                    }`}
            />
        </div>
    );
}