"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { signed, ownersLabel } from "@/lib/format";
import type { LiveEvent } from "@/lib/types";
import { isFixtureLive } from "@/lib/status";
import { MatchDetail } from "@/components/MatchDetail";

export function MatchStrip({ fixtures }: { fixtures: LiveEvent[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const match = useLofthus(openId != null ? ["match", openId] : null, () => api.match(openId as number), {
    live: true,
  });

  const open = useCallback((fixture: LiveEvent) => {
    setOpenId(fixture.id);
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
  }, []);

  useEffect(() => {
    if (openId == null) return;
    const onPop = () => setOpenId(null);
    window.history.pushState({ lofthusMatch: openId }, "");
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
    };
  }, [openId]);

  if (!fixtures.length) return null;

  return (
    <>
      <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {fixtures.map((fixture) => {
          const live = isFixtureLive(fixture.status);
          return (
            <button
              key={fixture.id}
              type="button"
              onClick={() => open(fixture)}
              className={`min-h-14 min-w-[13.5rem] shrink-0 snap-start border px-3 py-2.5 text-left transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                live ? "border-live bg-white" : "border-rule bg-white/50"
              }`}
            >
              <p className="font-condensed text-sm">
                {fixture.home} {fixture.home_score ?? "–"}–{fixture.away_score ?? "–"} {fixture.away}
              </p>
              <p className={`text-[11px] ${live ? "text-live" : "text-muted"}`}>
                {live ? "Live · " : ""}
                {fixture.lofthus_headline || fixture.status_label}
                {fixture.lofthus_owners
                  ? ` · ${ownersLabel(fixture.lofthus_owners)}${fixture.lofthus_captains ? ` · ${fixture.lofthus_captains} C` : ""}`
                  : ""}
                {fixture.lofthus_winner
                  ? ` · ${fixture.lofthus_winner.manager} ${signed(fixture.lofthus_winner.swing)}`
                  : ""}
              </p>
            </button>
          );
        })}
      </div>
      {openId != null ? (
        <MatchDetail
          data={match.data}
          loading={match.loading}
          error={match.error}
          onClose={() => {
            if (typeof window !== "undefined" && window.history.state?.lofthusMatch === openId) {
              window.history.back();
              return;
            }
            close();
          }}
        />
      ) : null}
    </>
  );
}
