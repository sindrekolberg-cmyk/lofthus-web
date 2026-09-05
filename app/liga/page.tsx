"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { QueryTabs } from "@/components/QueryTabs";
import { useSelectedManager } from "@/lib/selected-manager";

function LigaInner() {
  const params = useSearchParams();
  const view = params.get("view") || "standings";
  const league = useLofthus("league", () => api.league(), {
    refreshInterval: (d) => (d?.status.is_live ? 20_000 : 180_000),
  });
  const live = useLofthus("live", () => api.live(), {
    refreshInterval: (d) => (d?.status.is_live ? 20_000 : 180_000),
  });
  const month = useLofthus("month", () => api.month(), {
    refreshInterval: (d) => (d?.status.is_live ? 20_000 : 180_000),
  });
  const { entryId } = useSelectedManager();
  const status = league.data?.status || live.data?.status || month.data?.status || null;

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <p className="font-condensed text-xs tracking-[0.22em] text-live uppercase">
          {status?.is_live ? "Live" : status?.event_status_label || "Liga"}
        </p>
        <h1 className="mt-3 font-serif text-5xl leading-none text-ink sm:text-6xl">Liga</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Tre blikk på samme konkurranse: sammenlagt, live og måned.
          {status
            ? ` GW${status.event_id} er ${status.provisional ? "foreløpig" : "ferdig"}.`
            : ""}
        </p>

        <QueryTabs
          param="view"
          fallback="standings"
          tabs={[
            { id: "standings", label: "Sammenlagt" },
            { id: "live", label: "Live" },
            { id: "month", label: month.data?.month_name || "Måned" },
          ]}
        />

        {view === "live" ? (
          <div className="mt-8">
            {live.loading && !live.data ? <LoadingBlock /> : null}
            {live.error && !live.data ? <ApiState message={live.error} /> : null}
            {live.data ? (
              <>
                <p className="mb-4 text-sm text-muted">
                  {live.data.status.provisional
                    ? "Live-tabellen viser hvem som ligger an akkurat nå. Runden er ikke ferdig."
                    : "Runden er ferdig. Dette er GW-poengene."}
                </p>
                <div className="mb-6 flex gap-4 overflow-x-auto pb-2">
                  {live.data.fixtures.map((f) => (
                    <div key={f.id} className="min-w-[9rem] border border-rule px-3 py-2">
                      <p className="font-condensed text-sm">
                        {f.home} {f.home_score ?? "–"}–{f.away_score ?? "–"} {f.away}
                      </p>
                      <p className="text-[11px] text-muted">
                        {f.lofthus_headline || f.status_label}
                        {f.lofthus_winner ? ` · ${f.lofthus_winner.manager}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <LeagueTable
                  rows={live.data.gw_ranking.length ? live.data.gw_ranking : live.data.table}
                  status={live.data.status}
                  highlight={entryId}
                />
              </>
            ) : null}
          </div>
        ) : view === "month" ? (
          <div className="mt-8">
            {month.loading && !month.data ? <LoadingBlock /> : null}
            {month.error && !month.data ? <ApiState message={month.error} /> : null}
            {month.data ? (
              <>
                <h2 className="font-serif text-3xl">{month.data.month_name || "Aktiv måned"}</h2>
                <p className="mt-2 text-sm text-muted">
                  Ny måned blir aktiv når første gameweek i den måneden går live — ikke når
                  kalenderen skifter.
                </p>
                <div className="mt-6 overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left">
                    <thead>
                      <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                        <th className="py-3">#</th>
                        <th className="py-3">Manager</th>
                        <th className="py-3 text-right">Måned</th>
                        <th className="py-3 text-right">GW</th>
                      </tr>
                    </thead>
                    <tbody>
                      {month.data.table.map((row) => (
                        <tr key={row.entry} className="border-b border-rule">
                          <td className="py-3 font-condensed text-lg">{row.month_rank}</td>
                          <td className="py-3">
                            <Link href={`/manager/${row.entry}`} className="hover:underline">
                              {row.manager}
                            </Link>
                          </td>
                          <td className="py-3 text-right font-condensed text-lg tabular-nums">
                            {row.month_points}
                          </td>
                          <td className="py-3 text-right font-condensed tabular-nums text-muted">
                            {row.gw}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <h3 className="mt-12 font-serif text-2xl">Tidligere podier</h3>
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {month.data.previous.map((row) => (
                    <li
                      key={`${row.season}-${row.month}`}
                      className="grid gap-1 py-3 sm:grid-cols-12 sm:items-baseline"
                    >
                      <span className="font-condensed text-sm sm:col-span-3">
                        {row.month} {row.season}
                      </span>
                      <span className="sm:col-span-3">{row.winner || "ukjent"}</span>
                      <span className="text-muted sm:col-span-3">{row.runner_up || "ukjent"}</span>
                      <span className="text-muted sm:col-span-3">{row.third || "ukjent"}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        ) : (
          <div className="mt-8">
            {league.loading && !league.data ? <LoadingBlock /> : null}
            {league.error && !league.data ? <ApiState message={league.error} /> : null}
            {league.data ? (
              <LeagueTable rows={league.data.table} status={league.data.status} highlight={entryId} />
            ) : null}
          </div>
        )}
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
