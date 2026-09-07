"use client";

import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchStrip } from "@/components/MatchStrip";
import { randomPrizeFor } from "@/lib/randomPrize";

export default function LigaPage() {
  const league = useLofthus("league", () => api.league());
  const live = useLofthus("live", () => api.live());
  const status = live.data?.status || league.data?.status || null;
  const rows = live.data?.table || league.data?.table || [];
  const loading = !rows.length && (live.loading || league.loading);
  const error = live.error && league.error ? live.error : null;
  const fixtures = live.data?.fixtures || [];
  const prize = randomPrizeFor(status?.season);

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-12">
        {status?.is_live ? (
          <LiveIndicator gw={status.event_id} live label={status.round_kicker} />
        ) : (
          <p className="font-condensed text-xs tracking-[0.22em] text-muted uppercase">
            {status?.round_kicker || (status ? `Runde ${status.event_id}` : "Liga")}
          </p>
        )}

        <h1 className="mt-3 font-serif text-3xl leading-none text-ink sm:text-5xl">Liga</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">Hele ligaen, én tabell.</p>
        {prize ? (
          <p className="mt-2 font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            🎲 Årets randompremie: {prize.rank}. plass gir {prize.amount} kr
          </p>
        ) : null}

        {fixtures.length ? (
          <div className="mt-8">
            <MatchStrip fixtures={fixtures} />
          </div>
        ) : null}

        <div className="mt-8">
          {loading ? <LoadingBlock /> : null}
          {error && !rows.length ? <ApiState message={error} /> : null}
          {rows.length ? (
            <LeagueTable rows={rows} status={status} remaining sortable prize={prize} />
          ) : null}
        </div>
      </div>
    </main>
  );
}
