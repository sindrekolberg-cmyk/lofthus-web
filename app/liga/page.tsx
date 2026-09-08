"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchStrip } from "@/components/MatchStrip";
import { QueryTabs } from "@/components/QueryTabs";
import { randomPrizeFor } from "@/lib/randomPrize";

type LigaView = "total" | "month" | "tip";

function parseView(raw: string | null): LigaView {
  if (raw === "month" || raw === "tip") return raw;
  return "total";
}

function LigaInner() {
  const view = parseView(useSearchParams().get("view"));
  const league = useLofthus("league", () => api.league());
  const live = useLofthus("live", () => api.live());
  const tip = useLofthus(view === "tip" ? "preseason-tip" : null, () => api.preseasonTip(), {
    live: false,
  });
  const status = live.data?.status || league.data?.status || null;
  const rows = live.data?.table || league.data?.table || [];
  const loading = !rows.length && (live.loading || league.loading);
  const error = live.error && league.error ? live.error : null;
  const fixtures = live.data?.fixtures || [];
  const prize = view === "total" ? randomPrizeFor(status?.season) : null;
  const teams = new Map(rows.map((row) => [row.entry, row.team]));
  const preseasonRows = [...(tip.data?.rows || [])]
    .filter((row) => Number(row.preseason_odds) > 0)
    .sort(
      (a, b) =>
        Number(a.rank || 9999) - Number(b.rank || 9999) ||
        Number(a.preseason_odds) - Number(b.preseason_odds) ||
        a.manager.localeCompare(b.manager, "nb"),
    )
    .map((row, index) => ({
      ...row,
      tipRank: Number(row.rank || index + 1),
      team: teams.get(row.entry) || "",
    }));

  const blurb =
    view === "month"
      ? "Månedstabellen, rangert på månedspoeng."
      : view === "tip"
        ? "Tabelltipset er fryst før sesongstart og endres ikke etter resultatene i ligaen."
        : "Hele ligaen, én tabell.";

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-12">
        {status?.is_live ? (
          <LiveIndicator gw={status.event_id} live label={status.round_kicker} />
        ) : (
          <p className="font-condensed text-xs tracking-[0.22em] text-muted uppercase">
            {view === "tip"
              ? "Før sesongstart"
              : status?.round_kicker || (status ? `Runde ${status.event_id}` : "Liga")}
          </p>
        )}

        <h1 className="mt-3 font-serif text-3xl leading-none text-ink sm:text-5xl">Liga</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">{blurb}</p>
        {prize ? (
          <p className="mt-2 font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            🎲 Årets randompremie: {prize.rank}. plass gir {prize.amount} kr
          </p>
        ) : null}

        {fixtures.length && view !== "tip" ? (
          <div className="mt-8">
            <MatchStrip fixtures={fixtures} />
          </div>
        ) : null}

        <QueryTabs
          param="view"
          fallback="total"
          tabs={[
            { id: "total", label: "Totalpoeng" },
            { id: "month", label: "Måned" },
            { id: "tip", label: "Tabelltipset" },
          ]}
        />

        <div className="mt-8">
          {view === "tip" ? (
            <>
              <p className="font-condensed text-[11px] tracking-[0.18em] text-live uppercase">
                Tabelltips før GW1
              </p>
              {tip.loading && !tip.data ? <LoadingBlock label="Henter tabelltipset…" /> : null}
              {tip.error && !tip.data ? <ApiState message={tip.error} /> : null}
              {tip.data && !tip.data.ready ? (
                <ApiState title="Tabelltipset venter" message={tip.data.note || "Tabelltipset er ikke klart."} />
              ) : null}
              {tip.data?.ready ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse text-left">
                    <thead>
                      <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                        <th className="py-2 pr-3 font-medium">#</th>
                        <th className="py-2 pr-3 font-medium">Manager</th>
                        <th className="py-2 text-right font-medium">Odds</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preseasonRows.map((row) => (
                        <tr key={row.entry} className="border-b border-rule hover:bg-black/[0.03]">
                          <td className="py-3 pr-3 font-condensed text-lg tabular-nums text-live">{row.tipRank}</td>
                          <td className="py-3 pr-3">
                            <Link href={`/manager/${row.entry}`} className="inline-flex min-h-11 items-center font-serif text-lg hover:underline">
                              {row.manager}
                            </Link>
                            {row.team ? <span className="mt-0.5 block text-xs text-muted">{row.team}</span> : null}
                          </td>
                          <td className="py-3 text-right font-condensed text-lg tabular-nums">
                            {Number(row.preseason_odds).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {loading ? <LoadingBlock /> : null}
              {error && !rows.length ? <ApiState message={error} /> : null}
              {rows.length ? (
                <LeagueTable
                  key={view}
                  rows={rows}
                  status={status}
                  remaining
                  sortable
                  prize={prize}
                  variant={view}
                />
              ) : null}
            </>
          )}
        </div>
      </div>
    </main>
  );
}

export default function LigaPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <LigaInner />
    </Suspense>
  );
}
