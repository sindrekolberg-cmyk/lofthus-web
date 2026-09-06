"use client";

import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { MatchStrip } from "@/components/MatchStrip";

export function HeaderPulse() {
  const live = useLofthus("live", () => api.live());
  const fixtures = live.data?.fixtures || [];
  const status = live.data?.status;

  if (!fixtures.length) return null;

  return (
    <div className="border-b border-rule bg-white/80">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-2.5 sm:px-6">
        {status?.round_kicker ? (
          <p className="shrink-0 font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
            {status.round_kicker}
          </p>
        ) : null}
        <div className="min-w-0 flex-1">
          <MatchStrip fixtures={fixtures} />
        </div>
      </div>
    </div>
  );
}
