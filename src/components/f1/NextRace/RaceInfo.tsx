"use client";

import React from "react";
import { Race } from "../../../types/f1";
import { useLanguage } from "../../../i18n/LanguageContext";

interface RaceInfoProps {
  race: Race;
  // Preenchido quando a próxima corrida já é da temporada seguinte (ex.: "Temporada 2027")
  seasonLabel?: string;
}

export default function RaceInfo({ race, seasonLabel }: RaceInfoProps) {
  const { dict, lang } = useLanguage();
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

  const handleAddToCalendar = () => {
    const startDate = new Date(`${race.date}T${race.time}`);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); 

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const isPureIOSSafari = isIOS && 
                            /Safari/i.test(navigator.userAgent) && 
                            !/CriOS|FxiOS|EdgiOS|OPiOS|Brave/i.test(navigator.userAgent);

    if (isPureIOSSafari) {
        const formatICSDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, "").substring(0, 15) + "Z";
        const escapeICSText = (text: string) => text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");
        const icsContent = [
            "BEGIN:VCALENDAR",
            "VERSION:2.0",
            "PRODID:-//F1Dash//Gabriel Pimentel//PT",
            "BEGIN:VEVENT",
            `UID:f1dash-${race.season}-${race.round}@f1dash.pages.dev`,
            `DTSTAMP:${formatICSDate(new Date())}`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:${escapeICSText(`🏎️ F1: ${race.raceName}`)}`,
            `DESCRIPTION:${escapeICSText(dict.nextRace.calendarDesc || "Corrida gerada via F1Dash.")}`,
            `LOCATION:${escapeICSText(`${race.Circuit.circuitName}, ${race.Circuit.Location.locality}, ${race.Circuit.Location.country}`)}`,
            "END:VEVENT",
            "END:VCALENDAR"
        ].join("\r\n");

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
    <div className="w-full flex flex-col items-center text-center landscape:items-start landscape:text-left">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-500 font-bold uppercase tracking-widest text-[10px] sm:text-xs">
          {seasonLabel ?? dict.nextRace.title} • {dict.nextRace.round} {race.round}
        </span>
        {race.Sprint && (
          <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 border border-amber-400/40 bg-amber-400/10 rounded px-1.5 py-0.5" title={dict.nextRace.sprintWeekend}>
            {dict.nextRace.sprint}
          </span>
        )}
      </div>
      <h2 className="font-bold text-white uppercase tracking-wider leading-[1.05] text-balance text-[clamp(1.35rem,min(4.4vh,6.2vw)+0.2rem,3rem)]">
        {race.raceName}
      </h2>
      <p className="text-zinc-400 text-xs sm:text-sm lg:text-base mt-1.5 [@media(max-height:500px)]:hidden">
        {race.Circuit.circuitName} • {race.Circuit.Location.locality}, {race.Circuit.Location.country}
      </p>

      <button
        type="button"
        onClick={handleAddToCalendar}
        title={dict.nextRace.addToCalendarTooltip}
        className="group mt-[clamp(0.6rem,1.8vh,1.25rem)] flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-950/50 py-1.5 pl-3 pr-4 text-left shadow-lg transition-[color,background-color,border-color,scale] duration-200 ease-fluid hover:border-red-500/50 hover:bg-zinc-800/70 motion-safe:active:scale-[0.96]"
      >
        <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM12 11v6m-3-3h6" />
        </svg>
        <span className="flex flex-col leading-tight">
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-muted group-hover:text-red-400 transition-colors [@media(max-height:500px)]:hidden">
            {dict.nextRace.addToCalendar}
          </span>
          <span className="text-sm sm:text-base font-medium text-zinc-200 group-hover:text-white transition-colors">
            {capitalizedDate} {dict.nextRace.at} {formattedTime}
          </span>
        </span>
      </button>
    </div>
  );
}
