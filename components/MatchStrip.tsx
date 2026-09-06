"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ownersLabel } from "@/lib/format";
import type { LiveEvent } from "@/lib/types";
import { fixtureStatusLabel, isFixtureFinished, isFixtureLive } from "@/lib/status";
import { MatchDetail } from "@/components/MatchDetail";

export function MatchStrip({ fixtures }: { fixtures: LiveEvent[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const match = useLofthus(openId != null ? ["match", openId] : null, () => api.match(openId as number), {
    live: true,
  });
  const data = match.data?.fixture?.id === openId ? match.data : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  const open = useCallback((fixture: LiveEvent) => {
    setOpenId(fixture.id);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
  }, []);

  if (!fixtures.length) return null;

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {fixtures.map((fixture) => {
          const live = isFixtureLive(fixture.status);
          const finished = isFixtureFinished(fixture.status);
          const status = fixtureStatusLabel(fixture.status, fixture.status_label);
          const line = live
            ? fixture.lofthus_headline || status
            : finished
              ? [status, fixture.lofthus_headline].filter(Boolean).join(" · ")
              : status;
          return (
            <button
              key={fixture.id}
              type="button"
              onClick={() => open(fixture)}
              className={`min-h-14 min-w-[13.5rem] shrink-0 snap-start scroll-mb-[calc(4.75rem+env(safe-area-inset-bottom))] border px-3 py-2.5 text-left transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                live ? "border-live bg-white" : "border-rule bg-white/50"
              }`}
            >
              <p className="font-condensed text-sm">
                {fixture.home} {fixture.home_score ?? "–"}–{fixture.away_score ?? "–"} {fixture.away}
              </p>
              <p className={`text-[11px] ${live ? "text-live" : "text-muted"}`}>
                {line}
                {fixture.lofthus_owners
                  ? ` · ${ownersLabel(fixture.lofthus_owners)}${fixture.lofthus_captains ? ` · ${fixture.lofthus_captains} C` : ""}`
                  : ""}
              </p>
            </button>
          );
        })}
      </div>
      {openId != null && mounted
        ? createPortal(
            <MatchDetail
              fixtureId={openId}
              data={data}
              loading={!data && !match.error}
              error={match.error}
              onClose={close}
            />,
            document.body,
          )
        : null}
    </>
  );
}
