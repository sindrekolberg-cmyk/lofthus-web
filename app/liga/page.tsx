"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchStrip } from "@/components/MatchStrip";
import { QueryTabs } from "@/components/QueryTabs";
import { useSelectedManager } from "@/lib/selected-manager";

function LigaInner() {
  const params = useSearchParams();
  const view = params.get("view") || "standings";
  const league = useLofthus("league", () => api.league());
  const live = useLofthus("live", () => api.live());
  const month = useLofthus("month", () => api.month());
  const { entryId } = useSelectedManager();
  const status = league.data?.status || live.data?.status || month.data?.status || null;

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        {status?.is_live ? (
          <LiveIndicator gw={status.event_id} live />
        ) : (
          <p className="font-condensed text-xs tracking-[0.22em] text-muted uppercase">
            {status?.round_kicker || (status ? `Runde ${status.event_id}` : "Liga")}
          </p>
        )}
        <h1 className="mt-3 font-serif text-4xl leading-none text-ink sm:text-5xl">Liga</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
          Samme konkurranse, tre blikk.
        </p>

        <QueryTabs
          param="view"
          fallback="standings"
          tabs={[
            { id: "standings", label: "Sammenlagt" },
            { id: "live", label: status ? `Runde ${status.event_id}` : "Runde" },
            { id: "month", label: "Måned" },
          ]}
        />

        {view === "live" ? (
          <div className="mt-8">
            {live.loading && !live.data ? <LoadingBlock /> : null}
            {live.error && !live.data ? <ApiState message={live.error} /> : null}
            {live.data ? (
              <>
                <p className="mb-4 text-sm text-muted">
                  {live.data.status.is_live
                    ? "Slik det ligger an akkurat nå. Runden er ikke ferdig."
                    : live.data.status.provisional
                      ? "Kampene er ferdige. Poengene kan fortsatt flytte seg med bonus."
                      : "Runden er ferdig."}
                </p>
                <div className="mb-6">
                  <MatchStrip fixtures={live.data.fixtures} />
                </div>
                <LeagueTable
                  rows={live.data.table}
                  status={live.data.status}
                  highlight={entryId}
                  remaining
                  sortable
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
                  Ny måned starter når første runde i måneden går live.
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
                <h3 className="mt-12 font-serif text-2xl">Tidligere månedsvinnere</h3>
                <ul className="mt-4 divide-y divide-rule border-y border-rule">
                  {month.data.previous.map((row) => (
                    <li
                      key={`${row.season}-${row.month}`}
                      className="grid gap-1 py-3 sm:grid-cols-12 sm:items-baseline"
                    >
                      <span className="font-condensed text-sm sm:col-span-3">
                        {row.month} {row.season}
                      </span>
                      <span className="sm:col-span-3">{row.winner || "ikke registrert"}</span>
                      <span className="text-muted sm:col-span-3">{row.runner_up || ""}</span>
                      <span className="text-muted sm:col-span-3">{row.third || ""}</span>
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
              <LeagueTable rows={league.data.table} status={league.data.status} highlight={entryId} sortable />
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
