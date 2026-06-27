"use client";

import React, { useState, useEffect, useRef } from "react";
import { PastRace } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";

interface RaceInfoProps {
  race: PastRace;
}

export default function RaceInfo({ race }: RaceInfoProps) {
  const { dict, lang } = useLanguage();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          setShowTooltip(false);
        }
      },
      { threshold: 0.5 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let showTimer: NodeJS.Timeout;
    let hideTimer: NodeJS.Timeout;

    if (isVisible) {
      showTimer = setTimeout(() => {
        setShowTooltip(true);
        
        hideTimer = setTimeout(() => {
          setShowTooltip(false);
        }, 5000);
        
      }, 3000);
    }

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible]);

  const raceDateObj = new Date(`${race.date}T${race.time}`);
  const locale = lang === 'pt' ? 'pt-BR' : 'en-US';
  
  const formattedDate = raceDateObj.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  const formattedTime = raceDateObj.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });

  const formatSession = (session?: { date: string; time: string }) => {
    if (!session || !session.time) return "--";
    const sessionDate = new Date(`${session.date}T${session.time}`);
    const day = sessionDate.toLocaleDateString(locale, { weekday: "short" }).replace(".", "");
    const time = sessionDate.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${dict.nextRace.at} ${time}`;
  };

  const handleAddToCalendar = () => {
    setShowTooltip(false); 
    const startDate = new Date(`${race.date}T${race.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); 

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

    if (isIOS) {
        const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 15) + "Z";
        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//F1Dash//Gabriel Pimentel//PT",
            "BEGIN:VEVENT",
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:🏎️ F1: ${race.raceName}`,
            `DESCRIPTION:${dict.nextRace.calendarDesc || "Corrida gerada via F1Dash."}`,
            `LOCATION:${race.Circuit.circuitName}, ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\n");

        const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
        const url = window.URL.createObjectURL(blob);
        
        window.location.assign(url);
        
        setTimeout(() => window.URL.revokeObjectURL(url), 2000);
        
    } else {
        const formatGoogleDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 15) + "Z";
        const title = encodeURIComponent(`🏎️ F1: ${race.raceName}`);
        const details = encodeURIComponent(dict.nextRace.calendarDesc || "Corrida gerada via F1Dash.");
        const location = encodeURIComponent(`${race.Circuit.circuitName}, ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`);
        const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
        
        const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
        
        window.open(googleCalendarUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center md:items-start relative">
      <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-1 sm:mb-2">
        {dict.nextRace.title} • {dict.nextRace.round} {race.round}
      </span>
      <h2 className="text-xl sm:text-4xl font-bold text-white uppercase tracking-wider mb-1 text-center md:text-left">
        {race.raceName}
      </h2>
      <p className="text-gray-400 text-xs sm:text-base mb-3 sm:mb-6 text-center md:text-left">
        {race.Circuit.circuitName} • {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>

      <div className="relative mb-4 sm:mb-6">
        <button 
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 sm:gap-3 text-zinc-300 font-medium bg-zinc-950/50 hover:bg-zinc-800/80 hover:text-white transition-all py-2 px-4 sm:py-2 sm:px-4 rounded-lg border border-zinc-800/50 hover:border-red-500/50 text-sm sm:text-base cursor-pointer shadow-lg"
          aria-label="Adicionar corrida à agenda"
        >
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{capitalizedDate} {dict.nextRace.at} {formattedTime}</span>
        </button>

        {showTooltip && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-5 sm:top-1/2 sm:-translate-y-1/2 sm:mt-0 sm:left-auto sm:right-full sm:mr-3 sm:translate-x-0 bg-zinc-800 text-white text-[10px] sm:text-xs font-bold tracking-wider py-2 px-3 rounded-lg shadow-xl whitespace-nowrap pointer-events-none animate-bounce z-20 border border-zinc-700/50">
            {dict.nextRace.addToCalendarTooltip || "💡 Clique para adicionar à sua agenda!"}
            
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-zinc-800 border-t border-l border-zinc-700/50 rotate-45 sm:hidden"></div>
            
            <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-1.5 w-3 h-3 bg-zinc-800 border-t border-r border-zinc-700/50 rotate-45"></div>
          </div>
        )}
      </div>

      <div className="hidden [@media(min-height:750px)]:flex sm:flex flex-col w-full md:max-w-[80%] border-t border-zinc-800/50 pt-4 mb-4">
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 text-center md:text-left">
          {dict.nextRace.weekendHighlights}
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-zinc-950/30 rounded p-2 border border-zinc-800/30 flex flex-col justify-center items-center">
                <span className="text-zinc-500 font-bold uppercase text-[9px] mb-0.5">
                    {race.Sprint ? dict.nextRace.sprint : dict.nextRace.fp1}
                </span>
                <span className="text-white font-mono text-center">
                    {formatSession(race.Sprint || race.FirstPractice)}
                </span>
            </div>
            <div className="bg-zinc-950/30 rounded p-2 border border-zinc-800/30 flex flex-col justify-center items-center">
                <span className="text-zinc-500 font-bold uppercase text-[9px] mb-0.5">
                    {dict.nextRace.qualifying}
                </span>
                <span className="text-white font-mono text-center">
                    {formatSession(race.Qualifying)}
                </span>
            </div>
        </div>
      </div>
    </div>
  );
}