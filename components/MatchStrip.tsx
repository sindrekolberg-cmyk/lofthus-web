"use client";

import { useCallback, useState } from "react";
import { api } from "@/lib/api";
import { signed, ownersLabel } from "@/lib/format";
import type { LiveEvent, MatchImpact } from "@/lib/types";
import { MatchDetail } from "@/components/MatchDetail";

export function MatchStrip({ fixtures }: { fixtures: LiveEvent[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MatchImpact | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (fixture: LiveEvent) => {
    setOpenId(fixture.id);
    setLoading(true);
    setError(null);
    try {
      setDetail(await api.match(fixture.id));
    } catch (err) {
      setDetail(null);
      setError(err instanceof Error ? err.message : "Kunne ikke hente kampen akkurat nå.");
    } finally {
      setLoading(false);
    }
  }, []);

  const close = useCallback(() => {
    setOpenId(null);
    setDetail(null);
    setError(null);
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
        <MatchDetail data={detail} loading={loading} error={error} onClose={close} />
      ) : null}
    </>
  );
}
