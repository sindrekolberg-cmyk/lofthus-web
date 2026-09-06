"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { signed, ownersLabel } from "@/lib/format";
import type { LiveEvent } from "@/lib/types";
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

  if (!fixtures.length) return null;

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {fixtures.map((fixture) => (
          <button
            key={fixture.id}
            type="button"
            onClick={() => open(fixture)}
            className="min-w-[12rem] shrink-0 border border-rule bg-white/50 px-3 py-2 text-left transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <p className="font-condensed text-sm">
              {fixture.home} {fixture.home_score ?? "–"}–{fixture.away_score ?? "–"} {fixture.away}
            </p>
            <p className="text-[11px] text-muted">
              {fixture.lofthus_headline || fixture.status_label}
              {fixture.lofthus_owners
                ? ` · ${ownersLabel(fixture.lofthus_owners)}${fixture.lofthus_captains ? ` · ${fixture.lofthus_captains} C` : ""}`
                : ""}
              {fixture.lofthus_winner
                ? ` · ${fixture.lofthus_winner.manager} ${signed(fixture.lofthus_winner.swing)}`
                : ""}
            </p>
          </button>
        ))}
      </div>
      {openId != null ? (
        <MatchDetail data={match.data} loading={match.loading} error={match.error} onClose={close} />
      ) : null}
    </>
  );
}
