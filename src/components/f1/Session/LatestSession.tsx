"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../../../i18n/LanguageContext";
import { useAsyncData, useRetryEvery } from "../../../lib/hooks";
import { loadSeasonSessions, loadSessionData, sessionDataReady, sessionKind } from "../../../lib/openf1";
import SectionHeader from "../../ui/SectionHeader";
import SessionPodium from "./SessionPodium";

async function loadLatest() {
  const now = Date.now();
  const { sessions, meetings } = await loadSeasonSessions(now);
  const latest = sessions
    .filter((s) => sessionDataReady(s, now))
    .sort((a, b) => Date.parse(a.date_start) - Date.parse(b.date_start))
    .at(-1);
  if (!latest) return null;
  const data = await loadSessionData(latest.session_key);
  return { session: latest, meeting: meetings.find((m) => m.meeting_key === latest.meeting_key), data };
}

/** Bloco do Início com os três primeiros da última sessão disputada (treino, qualificação ou corrida). */
export default function LatestSession() {
  const { dict } = useLanguage();
  const { data, error, retrySilently } = useAsyncData("of1:latest", loadLatest);
  // Sem dados (OpenF1 bloqueado ou fora do ar, início de temporada): o bloco não aparece e
  // surge sozinho quando os dados chegam
  useRetryEvery(60_000, retrySilently, Boolean(error));
  if (!data || data.data.rows.length < 3) return null;

  const kind = sessionKind(data.session);
  const title = kind ? dict.sessions[kind] : data.session.session_name;

  return (
    <div className="shell flex flex-col gap-4 py-4 sm:py-6">
      <SectionHeader
        eyebrow={`${dict.home.latestSession} · ${data.meeting?.meeting_name ?? data.session.location}`}
        title={title}
        actions={
          <Link
            href={`/sessao?s=${data.session.session_key}`}
            className="tap inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-bold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
          >
            {dict.home.seeSession}
            <span aria-hidden="true">→</span>
          </Link>
        }
      />
      <SessionPodium rows={data.data.rows} kind={kind} />
    </div>
  );
}
