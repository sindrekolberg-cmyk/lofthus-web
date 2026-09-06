"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, place } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { SquadPitch } from "@/components/SquadPitch";
import { useSelectedManager } from "@/lib/selected-manager";

export default function ManagerPage() {
  const params = useParams<{ entryId: string }>();
  const entry = Number(params.entryId);
  const { setEntryId } = useSelectedManager();
  const { data, error, loading } = useLofthus(
    entry ? ["manager", entry] : null,
    () => api.manager(entry),
    { live: true },
  );

  if (loading && !data) {
    return (
      <main className="flex-1">
        <LoadingBlock label="Henter manager…" />
      </main>
    );
  }
  if (error && !data) {
    return (
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-[1400px]">
          <ApiState title="Manager ikke funnet" message={error} />
        </div>
      </main>
    );
  }
  if (!data) return null;

  const m = data.manager;
  const merits = data.lofthus_merits;

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-12">
        <Link
          href="/liga"
          className="inline-flex min-h-11 items-center font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
        >
          ← Tilbake til tabellen
        </Link>
        <p className="mt-6 font-condensed text-xs tracking-[0.22em] text-live uppercase">
          {data.is_live ? `Live · runde ${data.event_id}` : data.provisional ? `Runde ${data.event_id} · foreløpig` : "Manager"}
        </p>
        <h1 className="mt-2 font-serif text-3xl leading-none sm:text-5xl">{m.manager}</h1>
        <p className="mt-3 text-lg text-muted">{m.team}</p>
        <button
          type="button"
          className="mt-3 font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink"
          onClick={() => setEntryId(m.entry)}
        >
          Dette er meg
        </button>

        <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-ink pt-5 sm:mt-8 sm:grid-cols-5 sm:gap-6 sm:pt-6">
          <div>
            <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">Plass</dt>
            <dd className="font-condensed text-2xl font-semibold sm:text-3xl">{place(m.rank)}</dd>
          </div>
          <div>
            <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">Total</dt>
            <dd className="font-condensed text-2xl font-semibold sm:text-3xl">{m.total}</dd>
          </div>
          <div>
            <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">
              {data.provisional ? "Runde" : "GW"}
            </dt>
            <dd className="font-condensed text-2xl font-semibold sm:text-3xl">{m.gw}</dd>
          </div>
          <div>
            <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">
              Bevegelse
            </dt>
            <dd className="font-condensed text-3xl font-semibold">
              {moveLabel(m.rank_change, data.provisional)}
            </dd>
          </div>
          <div>
            <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">
              {data.month_name || "Måned"}
            </dt>
            <dd className="font-condensed text-3xl font-semibold">
              {m.month_rank ? place(m.month_rank) : "–"}
            </dd>
          </div>
        </dl>

        {data.story ? (
          <p className="mt-8 max-w-2xl font-serif text-xl leading-snug sm:text-2xl">{data.story}</p>
        ) : null}

        <h2 className="mt-8 font-serif text-2xl sm:mt-12 sm:text-3xl">
          Laget · Runde {data.event_id}
          {data.is_live ? " · live" : data.provisional ? " · foreløpig" : ""}
        </h2>
        <p className="mt-2 text-sm text-muted">
          {m.players_remaining} spillere gjenstår · {m.chip || "ingen sjetong"} · {m.hits ? `${m.hits} i trekk` : "ingen trekk"}
          {data.squad.xi.some((p) => p.autosub_status === "confirmed")
            ? " · autosub er med i laget"
            : data.squad.bench.some((p) => p.autosub_status === "pending")
              ? " · mulig autosub er ikke avgjort ennå"
              : ""}
        </p>
        <div className="mt-6">
          <SquadPitch squad={data.squad} />
        </div>

        <div className="mt-6 flex flex-wrap gap-4">
          <Link
            href={`/analyse/rivalradar?me=${m.entry}`}
            className="font-condensed text-[12px] tracking-[0.16em] uppercase hover:underline"
          >
            Rivalradar →
          </Link>
          <Link
            href={`/analyse/compare?a=${m.entry}`}
            className="font-condensed text-[12px] tracking-[0.16em] uppercase hover:underline"
          >
            Sammenlign →
          </Link>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="space-y-12 lg:col-span-5">
          <section>
          <h2 className="font-serif text-2xl sm:text-3xl">Lofthus-karriere</h2>
            <p className="mt-2 text-sm text-muted">
              {data.lofthus_membership?.length
                ? `Første sesong i ligaen: ${[...data.lofthus_membership].map((r) => r.season).filter(Boolean).sort()[0]}`
                : "Første sesong i ligaen er ikke registrert."}
            </p>
            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-xs text-muted">Beste plassering</dt>
                <dd className="font-condensed text-2xl">
                  {data.lofthus_best_finish ? place(data.lofthus_best_finish) : "–"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Sammenlagtseier</dt>
                <dd className="font-condensed text-2xl">{merits.league_gold}</dd>
                <dd className="text-sm text-muted">{merits.league_seasons?.join(", ") || ""}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Cupgull</dt>
                <dd className="font-condensed text-2xl">{merits.cup_gold}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Månedsseiere</dt>
                <dd className="font-condensed text-2xl">{merits.monthly_gold}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Månedspodier</dt>
                <dd className="font-condensed text-2xl">
                  {merits.monthly_gold + merits.monthly_silver + merits.monthly_bronze}
                </dd>
              </div>
            </dl>
            {data.lofthus_overall.length ? (
              <ul className="mt-4 text-sm">
                {data.lofthus_overall.map((row) => (
                  <li key={row.season}>
                    {row.season}: {place(row.place)} sammenlagt
                  </li>
                ))}
              </ul>
            ) : null}
            {data.lofthus_membership?.length ? (
              <ul className="mt-4 text-sm text-muted">
                {data.lofthus_membership.map((row) => (
                  <li key={row.season}>
                    {row.season}
                    {row.final_rank ? ` · ${row.final_rank}.` : ""}
                  </li>
                ))}
              </ul>
            ) : null}
          </section>

          <section>
            <h2 className="font-serif text-2xl sm:text-3xl">FPL-karriere</h2>
            <p className="mt-2 text-sm text-muted">
              Offisiell Fantasy Premier League-historikk for denne entryen.
            </p>
            {data.fpl_season?.total_points ? (
              <p className="mt-4 text-sm">
                Denne FPL-sesongen: {data.fpl_season.total_points} poeng
                {data.fpl_season.overall_rank
                  ? ` · overall ${data.fpl_season.overall_rank.toLocaleString("nb-NO")}`
                  : ""}
              </p>
            ) : null}
            {data.chips.length ? (
              <ul className="mt-4 text-sm">
                {data.chips.map((c) => (
                  <li key={`${c.chip}-${c.event}`}>
                    {c.chip} · {c.gw}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-muted">Ingen sjetonger brukt ennå.</p>
            )}
            {data.fpl_career.length ? (
              <table className="mt-4 w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                    <th className="py-2">Sesong</th>
                    <th className="py-2 text-right">Poeng</th>
                    <th className="py-2 text-right">Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {data.fpl_career.map((row) => (
                    <tr key={row.season} className="border-b border-rule">
                      <td className="py-2">{row.season}</td>
                      <td className="py-2 text-right font-condensed">{row.points}</td>
                      <td className="py-2 text-right font-condensed">
                        {row.overall_rank ? row.overall_rank.toLocaleString("nb-NO") : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-4 text-sm text-muted">Ingen FPL-historikk lastet ennå.</p>
            )}
          </section>
          </div>

          <section className="lg:col-span-7">
            <h2 className="font-serif text-2xl sm:text-3xl">Form</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {data.form.map((row) => (
                <div key={row.event} className="border border-rule px-3 py-2">
                  <p className="font-condensed text-[10px] tracking-[0.14em] text-muted uppercase">
                    GW{row.event}
                    {row.is_live ? " · live" : ""}
                  </p>
                  <p className="font-condensed text-2xl">{row.points}</p>
                  <p className="text-xs text-muted">{place(row.league_rank)} i Lofthus</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
