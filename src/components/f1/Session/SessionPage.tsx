"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../../i18n/LanguageContext";
import { useAsyncData, useNow } from "../../../lib/hooks";
import {
  loadSeasonSessions,
  loadSessionData,
  type OF1Session,
  sessionDataReady,
  sessionIsLive,
  sessionKind,
} from "../../../lib/openf1";
import SectionHeader from "../../ui/SectionHeader";
import Select from "../../ui/Select";
import Spinner from "../../ui/Spinner";
import SessionPodium from "./SessionPodium";
import TimingTable from "./TimingTable";
import TopSpeed from "./TopSpeed";
import SectorBoard from "./SectorBoard";

/**
 * Página "Sessão": classificação, velocidade máxima e setores de cada treino, qualificação e corrida
 * (OpenF1, de 2023 para cá). Abre na última sessão com dados; a escolha fica no endereço (?s=11407).
 */
export default function SessionPage() {
  const { dict } = useLanguage();
  const t = dict.session;
  const router = useRouter();
  const params = useSearchParams();
  const now = useNow(60_000);

  const season = useAsyncData("of1:season", () => loadSeasonSessions(Date.now()));
  const sessions = [...(season.data?.sessions ?? [])].sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start));
  const meetings = season.data?.meetings ?? [];
  const readySessions = sessions.filter((s) => sessionDataReady(s, now));

  const requested = Number(params.get("s"));
  const selected = sessions.find((s) => s.session_key === requested) ?? readySessions.at(-1);
  const meeting = meetings.find((m) => m.meeting_key === selected?.meeting_key);
  const live = sessions.find((s) => sessionIsLive(s, now));
  const selectedReady = selected ? sessionDataReady(selected, now) : false;

  const data = useAsyncData(selected && selectedReady ? `of1:session:${selected.session_key}` : null, () =>
    loadSessionData(selected!.session_key),
  );

  const select = (sessionKey: number) => router.replace(`/sessao?s=${sessionKey}`, { scroll: false });

  const sessionLabel = (session: OF1Session) => {
    const kind = sessionKind(session);
    return kind ? dict.sessions[kind] : session.session_name;
  };
  const shortLabel = (session: OF1Session) => {
    const kind = sessionKind(session);
    return kind ? dict.sessionsShort[kind] : session.session_name;
  };

  if (season.loading) {
    return (
      <div className="shell min-h-[60svh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (season.error || !selected) {
    return (
      <div className="shell min-h-[60svh] flex flex-col items-center justify-center gap-3 text-center">
        <span className="text-sm text-zinc-300">{season.error ? t.unavailable : t.noSessions}</span>
        {Boolean(season.error) && (
          <button type="button" onClick={season.reload} className="tap rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15">
            {dict.errors.tryAgain}
          </button>
        )}
      </div>
    );
  }

  // Etapas com alguma sessão já iniciada, da mais recente para a mais antiga
  const startedMeetings = meetings
    .filter((m) => sessions.some((s) => s.meeting_key === m.meeting_key && Date.parse(s.date_start) <= now))
    .sort((a, b) => Date.parse(b.date_start) - Date.parse(a.date_start));
  const meetingSessions = sessions.filter((s) => s.meeting_key === selected.meeting_key);
  const kind = sessionKind(selected);

  return (
    <div className="shell flex flex-col gap-4 sm:gap-5 py-4 sm:py-6">
      <SectionHeader
        eyebrow={meeting ? `${meeting.meeting_name} · ${selected.year}` : t.title}
        title={sessionLabel(selected)}
        actions={
          startedMeetings.length > 1 && (
            <Select
              ariaLabel={t.pickMeeting}
              align="right"
              value={String(selected.meeting_key)}
              options={startedMeetings.map((m) => ({ value: String(m.meeting_key), label: m.meeting_name }))}
              onChange={(value) => {
                const ready = sessions.filter((s) => s.meeting_key === Number(value) && sessionDataReady(s, now));
                const target = ready.at(-1) ?? sessions.find((s) => s.meeting_key === Number(value));
                if (target) select(target.session_key);
              }}
            />
          )
        }
      />

      {/* Sessões da etapa: as que ainda não têm dados ficam apagadas; a que está rolando pisca */}
      <div className="reveal -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]" style={{ "--i": 1 } as React.CSSProperties}>
        {meetingSessions.map((session) => {
          const active = session.session_key === selected.session_key;
          const isLive = sessionIsLive(session, now);
          const ready = sessionDataReady(session, now);
          return (
            <button
              key={session.session_key}
              type="button"
              onClick={() => select(session.session_key)}
              aria-pressed={active}
              className={`tap flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-bold uppercase tracking-wide transition-colors duration-150 ${
                active ? "border-red-500/70 bg-red-500/15 text-white" : ready ? "border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10" : "border-white/5 text-zinc-500"
              }`}
            >
              {isLive && <span className="h-1.5 w-1.5 rounded-full bg-red-500 motion-safe:animate-pulse" />}
              {shortLabel(session)}
            </button>
          );
        })}
      </div>

      {live && (
        <div className="reveal glass flex items-center gap-3 rounded-2xl border-red-500/40 px-4 py-3" style={{ "--i": 2 } as React.CSSProperties}>
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <p className="text-sm text-zinc-200">
            <span className="font-bold uppercase tracking-wide text-red-400">{t.liveNow}: {sessionLabel(live)}.</span> {t.liveNote}
          </p>
        </div>
      )}

      {!selectedReady ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-zinc-300">{sessionIsLive(selected, now) ? t.liveNote : t.upcoming}</p>
      ) : data.loading ? (
        <div className="min-h-[40svh] flex items-center justify-center">
          <Spinner />
        </div>
      ) : data.error || !data.data ? (
        <div className="glass rounded-2xl px-4 py-6 flex flex-col items-center gap-3 text-center">
          <span className="text-sm text-zinc-300">{t.unavailable}</span>
          <button type="button" onClick={data.reload} className="tap rounded-full bg-white/10 px-4 py-2 text-sm font-bold hover:bg-white/15">
            {dict.errors.tryAgain}
          </button>
        </div>
      ) : !data.data.hasData ? (
        <p className="glass rounded-2xl px-4 py-6 text-center text-sm text-zinc-300">{t.noData}</p>
      ) : (
        <div key={selected.session_key} className="swap-in flex flex-col gap-4 sm:gap-5">
          <SessionPodium rows={data.data.rows} kind={kind} />
          <div className="grid items-start gap-4 sm:gap-5 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
            <TimingTable rows={data.data.rows} kind={kind} fastestLap={data.data.fastest?.lap ?? null} />
            <TopSpeed rows={data.data.rows} />
          </div>
          <SectorBoard data={data.data} />
        </div>
      )}
    </div>
  );
}
