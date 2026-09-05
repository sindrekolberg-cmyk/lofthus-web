"use client";

import Link from "next/link";
import { ManagerSearch } from "@/components/ManagerSearch";
import { useSelectedManager } from "@/lib/selected-manager";
import { moveLabel, place } from "@/lib/format";
import type { ManagerOption, Status } from "@/lib/types";

type Props = {
  managers: ManagerOption[];
  status: Status | null;
};

export function MinLofthus({ managers, status }: Props) {
  const { entryId, setEntryId } = useSelectedManager();
  const ranked = [...managers].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  const me = ranked.find((m) => m.entry === entryId);
  const rival = me
    ? ranked.find((m) => m.rank === me.rank - 1) ||
      ranked.find((m) => m.rank === me.rank + 1)
    : null;

  return (
    <section className="border-t border-rule bg-white/40">
      <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
        <p className="font-condensed text-[12px] tracking-[0.22em] text-live uppercase">
          Min Lofthus
        </p>
        <div className="mt-2 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="font-serif text-3xl leading-none sm:text-4xl">
              {me ? me.manager : "Velg deg selv"}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-muted">
              Virker for alle i ligaen, ikke bare topp 5. Søk på manager, lag
              eller entry.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <ManagerSearch managers={managers} />
          </div>
        </div>

        {me ? (
          <dl className="mt-8 grid grid-cols-2 gap-5 border-t border-ink pt-6 sm:grid-cols-4">
            <div>
              <dt className="text-xs text-muted">Plass</dt>
              <dd className="font-condensed text-3xl">{place(me.rank)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">
                {status?.provisional ? "Live GW" : "GW"}
              </dt>
              <dd className="font-condensed text-3xl">{me.gw ?? "–"}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Bevegelse</dt>
              <dd className="font-condensed text-3xl">
                {moveLabel(me.rank_change || 0, Boolean(status?.provisional))}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted">Nærmeste</dt>
              <dd className="truncate font-serif text-2xl">
                {rival ? (
                  <Link href={`/manager/${rival.entry}`} className="hover:underline">
                    {rival.manager}
                  </Link>
                ) : (
                  "–"
                )}
              </dd>
            </div>
          </dl>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-4 font-condensed text-[12px] tracking-[0.14em] uppercase">
          {me ? (
            <>
              <Link href={`/manager/${me.entry}`} className="hover:underline">
                Min profil →
              </Link>
              <Link
                href={`/analyse/rivalradar?me=${me.entry}`}
                className="hover:underline"
              >
                Rivalradar →
              </Link>
              <button
                type="button"
                className="text-muted hover:text-ink"
                onClick={() => setEntryId(0)}
              >
                Bytt manager
              </button>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
