"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { ApiState, LoadingBlock } from "@/components/ApiState";

export default function PlayerPage() {
  const params = useParams<{ id: string }>();
  const element = Number(params.id || 0);
  const { data, error, loading } = useLofthus(
    element > 0 ? "ownership" : null,
    () => api.analysisOwnership(),
    { live: true },
  );
  const player = (data?.players || []).find((row) => Number(row.element) === element);

  if (loading && !data) {
    return (
      <main className="flex-1">
        <LoadingBlock label="Henter eierskap…" />
      </main>
    );
  }

  if (error && !data) {
    return (
      <main className="flex-1 px-4 py-16">
        <div className="mx-auto max-w-[1400px]">
          <ApiState title="Spiller ikke funnet" message={error} />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-paper">
      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 md:py-12">
        <Link
          href="/analyse/ownership"
          className="inline-flex min-h-11 items-center font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
        >
          ← Eierskap
        </Link>

        {data && !player ? (
          <div className="mt-8">
            <ApiState title="Fant ikke spilleren" message="Fant ikke spilleren i den aktive ligaoversikten." />
          </div>
        ) : null}

        {player ? (
          <>
            <p className="mt-6 font-condensed text-xs tracking-[0.22em] text-live uppercase">Eierskap</p>
            <h1 className="mt-2 font-serif text-3xl leading-none sm:text-5xl">{player.player}</h1>
            <p className="mt-3 text-lg text-muted">{player.club || ""}</p>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-ink pt-5 sm:gap-6">
              <div>
                <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">Lofthus</dt>
                <dd className="font-condensed text-2xl font-semibold sm:text-3xl">
                  {Number(player.ownership_pct || 0).toFixed(0)} %
                </dd>
              </div>
              <div>
                <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">Globalt</dt>
                <dd className="font-condensed text-2xl font-semibold sm:text-3xl">
                  {player.global_ownership_pct != null
                    ? `${Number(player.global_ownership_pct).toFixed(0)} %`
                    : "–"}
                </dd>
              </div>
              <div>
                <dt className="font-condensed text-[10px] tracking-[0.16em] text-muted uppercase">GW-poeng</dt>
                <dd className="font-condensed text-2xl font-semibold sm:text-3xl">{player.event_points}</dd>
              </div>
            </dl>

            <h2 className="mt-10 font-condensed text-[12px] tracking-[0.16em] text-live uppercase">
              Eies av {player.ownership_count} i ligaen
            </h2>
            <ul className="mt-3 divide-y divide-rule border-y border-ink">
              {(player.owners || []).map((owner) => (
                <li key={owner.entry}>
                  <Link
                    href={`/manager/${owner.entry}`}
                    className="flex min-h-16 items-center gap-3 py-2 hover:bg-black/[0.02]"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-serif text-lg leading-tight">{owner.manager}</span>
                      <span className="block text-xs text-muted">{owner.team}</span>
                    </span>
                    <span className="flex gap-1">
                      {owner.is_triple_captain ? (
                        <span className="bg-ink px-2 py-0.5 font-condensed text-[10px] tracking-[0.12em] text-paper uppercase">
                          TC
                        </span>
                      ) : owner.is_captain ? (
                        <span className="bg-ink px-2 py-0.5 font-condensed text-[10px] tracking-[0.12em] text-paper uppercase">
                          C
                        </span>
                      ) : null}
                      {owner.on_bench ? (
                        <span className="bg-black/[0.05] px-2 py-0.5 font-condensed text-[10px] tracking-[0.12em] text-muted uppercase">
                          Benk
                        </span>
                      ) : null}
                    </span>
                    <span className="text-muted" aria-hidden>
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            {!(player.owners || []).length ? (
              <p className="mt-4 text-sm text-muted">Ingen i ligaen eier spilleren.</p>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  );
}
