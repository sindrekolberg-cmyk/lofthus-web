"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { QueryTabs } from "@/components/QueryTabs";

function HallInner() {
  const tab = useSearchParams().get("tab") || "overview";
  const hof = useLofthus("hof", () => api.hallOfFame(), { live: false });
  const data = hof.data;

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <p className="font-condensed text-xs tracking-[0.22em] text-live uppercase">Arkiv</p>
        <h1 className="mt-3 font-serif text-5xl leading-none sm:text-6xl">Hall of Fame</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Det store Lofthus-arkivet. Sammenlagt, cup, måned og meritter. Ukjent
          vises som ukjent — vi gjetter ikke.
        </p>

        <QueryTabs
          param="tab"
          fallback="overview"
          tabs={[
            { id: "overview", label: "Oversikt" },
            { id: "seasons", label: "Sesonger" },
            { id: "month", label: "Måned" },
            { id: "cup", label: "Cup" },
            { id: "random", label: "Random" },
            { id: "managers", label: "Managere" },
          ]}
        />

        {hof.loading && !data ? <LoadingBlock /> : null}
        {hof.error && !data ? <ApiState message={hof.error} /> : null}

        {data && tab === "overview" ? (
          <>
            {data.records ? (
              <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {Object.values(data.records)
                  .filter(Boolean)
                  .map((rec) =>
                    rec ? (
                      <div key={rec.field} className="border border-rule p-4">
                        <dt className="font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                          {rec.label}
                        </dt>
                        <dd className="mt-2 font-serif text-2xl">{rec.manager}</dd>
                        <dd className="font-condensed text-sm text-muted">{rec.value}</dd>
                      </div>
                    ) : null,
                  )}
              </dl>
            ) : null}
          <div className="mt-10 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                  <th className="py-3">#</th>
                  <th className="py-3">Manager</th>
                  <th className="py-3 text-right">Liga</th>
                  <th className="py-3 text-right">Cup</th>
                  <th className="py-3 text-right">Måned</th>
                  <th className="py-3 text-right">Sølv</th>
                  <th className="py-3 text-right">Bronse</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((row) => (
                  <tr key={row.manager} className="border-b border-rule">
                    <td className="py-3 font-condensed">{row.rank}</td>
                    <td className="py-3">{row.manager}</td>
                    <td className="py-3 text-right font-condensed">{row.league_gold}</td>
                    <td className="py-3 text-right font-condensed">{row.cup_gold}</td>
                    <td className="py-3 text-right font-condensed">{row.monthly_gold}</td>
                    <td className="py-3 text-right font-condensed">{row.silver}</td>
                    <td className="py-3 text-right font-condensed">{row.bronze}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : null}

        {data && tab === "seasons" ? (
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {(data.overall || []).map((row) => (
              <li key={row.season} className="grid gap-1 py-4 sm:grid-cols-12">
                <span className="font-condensed sm:col-span-2">{row.season}</span>
                <span className="sm:col-span-3">1. {row.winner || "ukjent"}</span>
                <span className="text-muted sm:col-span-3">2. {row.runner_up || "ukjent"}</span>
                <span className="text-muted sm:col-span-4">3. {row.third_place || "ukjent"}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {data && tab === "month" ? (
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {(data.monthly || []).map((row) => (
              <li key={`${row.season}-${row.month}`} className="grid gap-1 py-3 sm:grid-cols-12">
                <span className="font-condensed sm:col-span-3">
                  {row.month} {row.season}
                </span>
                <span className="sm:col-span-3">{row.winner || "ukjent"}</span>
                <span className="text-muted sm:col-span-3">{row.runner_up || "ukjent"}</span>
                <span className="text-muted sm:col-span-3">{row.third || "ukjent"}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {data && tab === "cup" ? (
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {(data.cup || []).map((row) => (
              <li key={row.season} className="grid gap-1 py-4 sm:grid-cols-12">
                <span className="font-condensed sm:col-span-2">{row.season}</span>
                <span className="sm:col-span-4">{row.winner || "ukjent"}</span>
                <span className="text-muted sm:col-span-6">{row.runner_up || "ukjent"}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {data && tab === "random" ? (
          (data.random || []).length ? (
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {(data.random || []).map((row) => (
                <li key={`${row.season}-${row.winner}`} className="grid gap-1 py-4 sm:grid-cols-12">
                  <span className="font-condensed sm:col-span-2">{row.season}</span>
                  <span className="sm:col-span-4">{row.winner || "ukjent"}</span>
                  <span className="text-muted sm:col-span-6">
                    {row.placement || row.note || ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-sm text-muted">Ingen random-resultater i arkivet ennå.</p>
          )
        ) : null}

        {data && tab === "managers" ? (
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {data.rows.map((row) => (
              <li key={row.manager} className="py-4">
                <p className="font-serif text-2xl">{row.manager}</p>
                <p className="mt-1 text-sm text-muted">
                  Liga {row.league_gold} · Cup {row.cup_gold} · Måned {row.monthly_gold} · podier{" "}
                  {row.podiums}
                  {row.league_seasons?.length
                    ? ` · sesonger: ${row.league_seasons.join(", ")}`
                    : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-10 text-sm text-muted">
          2024/25 bronse: Rasmus Grytvik-Skoglund. Canonical navn kommer fra arkivet.
        </p>
      </div>
    </main>
  );
}

export default function HallOfFamePage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <HallInner />
    </Suspense>
  );
}
