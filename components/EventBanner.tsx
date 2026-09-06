"use client";

import { useLiveSession } from "@/lib/live-session";

export function EventBanner() {
  const { banner, events, stale, sseOpen, transport } = useLiveSession();
  return (
    <div className="border-b border-rule bg-white/70">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-1.5 sm:px-6">
        <p className="shrink-0 font-condensed text-[11px] tracking-[0.16em] uppercase text-muted">
          {stale ? (
            <span className="text-live">Live-data er forsinket</span>
          ) : sseOpen ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" aria-hidden />
              Live
            </span>
          ) : transport === "connecting" ? (
            "Oppdaterer…"
          ) : (
            "Oppdaterer…"
          )}
        </p>
        {banner ? (
          <p className="min-w-0 truncate font-condensed text-[12px] tracking-[0.12em] uppercase">
            <span className="text-live">{banner.banner}</span>
            <span className="text-ink"> {banner.label}</span>
          </p>
        ) : events[0] ? (
          <p className="min-w-0 truncate text-[12px] text-muted">
            {events[0].banner} {events[0].label}
          </p>
        ) : (
          <p className="min-w-0 truncate text-[12px] text-muted">Venter på neste utslag</p>
        )}
      </div>
    </div>
  );
}
