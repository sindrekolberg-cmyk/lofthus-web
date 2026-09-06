"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { HOF_POINTS_EXPLAIN, historicalPoints, monthPodiums } from "@/lib/hof-points";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { QueryTabs } from "@/components/QueryTabs";

function HallInner() {
  const tab = useSearchParams().get("tab") || "overview";
  const hof = useLofthus("hof", () => api.hallOfFame(), { live: false });
  const data = hof.data;
  const [showPoints, setShowPoints] = useState(false);

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-12">
        <p className="font-condensed text-xs tracking-[0.22em] text-live uppercase">Historie</p>
        <h1 className="mt-3 font-serif text-3xl leading-none sm:text-5xl">Hall of Fame</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
          Hele Lofthus-historien: sammenlagt, cup, måneder og meritter.
        </p>

        <QueryTabs
          param="tab"
          fallback="overview"
          tabs={[
            { id: "overview", label: "Oversikt" },
            { id: "seasons", label: "Sesong for sesong" },
            { id: "month", label: "Månedsvinnere" },
            { id: "cup", label: "Cupvinnere" },
            { id: "random", label: "Random plassering" },
            { id: "managers", label: "Detaljert manageroversikt" },
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
                      <div key={rec.field} className="border border-rule bg-white/40 p-4">
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
                    <th className="py-3 text-right">Sammenlagt</th>
                    <th className="py-3 text-right">Cupgull</th>
                    <th className="py-3 text-right">Månedsseier</th>
                    <th className="py-3 text-right">Månedssølv</th>
                    <th className="py-3 text-right">Månedsbronse</th>
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
                      <td className="py-3 text-right font-condensed">{row.monthly_silver}</td>
                      <td className="py-3 text-right font-condensed">{row.monthly_bronze}</td>
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
                <span className="sm:col-span-3">1. {row.winner || "ikke registrert"}</span>
                <span className="text-muted sm:col-span-3">2. {row.runner_up || "ikke registrert"}</span>
                <span className="text-muted sm:col-span-4">3. {row.third_place || "ikke registrert"}</span>
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
                <span className="sm:col-span-3">{row.winner || "ikke registrert"}</span>
                <span className="text-muted sm:col-span-3">{row.runner_up || ""}</span>
                <span className="text-muted sm:col-span-3">{row.third || ""}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {data && tab === "cup" ? (
          <ul className="mt-8 divide-y divide-rule border-y border-rule">
            {(data.cup || []).map((row) => (
              <li key={row.season} className="grid gap-1 py-4 sm:grid-cols-12">
                <span className="font-condensed sm:col-span-2">{row.season}</span>
                <span className="sm:col-span-4">{row.winner || "ikke registrert"}</span>
                <span className="text-muted sm:col-span-6">{row.runner_up || ""}</span>
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
                  <span className="sm:col-span-4">{row.winner || "ikke registrert"}</span>
                  <span className="text-muted sm:col-span-6">
                    {row.placement || row.note || ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-sm text-muted">Ingen random-resultater registrert.</p>
          )
        ) : null}

        {data && tab === "managers" ? (
          <div className="mt-8">
            <button
              type="button"
              className="font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink"
              onClick={() => setShowPoints((v) => !v)}
              aria-expanded={showPoints}
            >
              {showPoints ? "Skjul poengsystem" : "Se poengsystem"}
            </button>
            {showPoints ? (
              <ul className="mt-3 max-w-md text-sm text-muted">
                {HOF_POINTS_EXPLAIN.map((row) => (
                  <li key={row.label} className="flex justify-between border-b border-rule py-1">
                    <span>{row.label}</span>
                    <span className="font-condensed">{row.value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {data.rows.map((row) => (
                <li key={row.manager} className="py-6">
                  <p className="font-serif text-2xl">{row.manager}</p>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-xs text-muted">Sammenlagtseier</dt>
                      <dd className="font-condensed text-2xl">{row.league_gold}</dd>
                      <dd className="text-sm text-muted">
                        {row.league_seasons?.length ? row.league_seasons.join(", ") : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Cupgull</dt>
                      <dd className="font-condensed text-2xl">{row.cup_gold}</dd>
                      <dd className="text-sm text-muted">
                        {row.cup_seasons?.length ? row.cup_seasons.join(", ") : ""}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Månedsseiere</dt>
                      <dd className="font-condensed text-2xl">{row.monthly_gold}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted">Månedspodier</dt>
                      <dd className="font-condensed text-2xl">{monthPodiums(row)}</dd>
                    </div>
                  </dl>
                  <p className="mt-4 text-sm">
                    Historiske poeng{" "}
                    <span className="font-condensed text-xl">{historicalPoints(row)}</span>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
