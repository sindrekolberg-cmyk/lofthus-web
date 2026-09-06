"use client";

import { useLiveSession } from "@/lib/live-session";

export function EventBanner({
  gw,
  footballLive,
  finished,
}: {
  gw?: number;
  footballLive?: boolean;
  finished?: boolean;
}) {
  const { banner, stale } = useLiveSession();
  const liveNow = Boolean(footballLive);
  const round = gw || 0;

  let line = round ? `Runde ${round}` : "Runde";
  if (stale && liveNow) {
    line = "Live-data er forsinket";
  } else if (liveNow && round) {
    line = `LIVE · Runde ${round}`;
  } else if (finished && round) {
    line = `Runde ${round} ferdig`;
  } else if (round) {
    line = `Runde ${round} · venter på neste kamp`;
  }

  return (
    <div className="border-b border-rule bg-white/70">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-1.5 sm:px-6">
        <p className="shrink-0 font-condensed text-[11px] tracking-[0.16em] uppercase text-muted">
          {liveNow && !stale ? (
            <span className="inline-flex items-center gap-1.5 text-live">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-live" aria-hidden />
              {line}
            </span>
          ) : stale && liveNow ? (
            <span className="text-live">{line}</span>
          ) : (
            <span>{line}</span>
          )}
        </p>
        {banner ? (
          <p className="min-w-0 truncate font-condensed text-[12px] tracking-[0.12em] uppercase">
            <span className="text-live">{banner.banner}</span>
            <span className="text-ink"> {banner.label}</span>
          </p>
        ) : (
          <p className="hidden min-w-0 truncate text-[12px] text-muted md:block">Venter på neste utslag</p>
        )}
      </div>
    </div>
  );
}
