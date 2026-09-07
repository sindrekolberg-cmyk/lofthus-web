"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, storyHref, storyCategory } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchStrip } from "@/components/MatchStrip";
import { PlayerImage } from "@/components/PlayerImage";
import { useSelectedManager } from "@/lib/selected-manager";

export function HomePage() {
  const { entryId } = useSelectedManager();
  const polled = useLofthus("home", () => api.home());
  const data = polled.data;

  if (!data) {
    if (polled.error) {
      return (
        <main className="flex-1 px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-[1400px]">
            <ApiState title="Forsiden venter" message={polled.error} />
          </div>
        </main>
      );
    }
    return (
      <main className="flex-1">
        <LoadingBlock label="Henter Lofthus…" />
      </main>
    );
  }

  const status = data.status;
  const snakkiser = data.news.slice(0, 5);
  const climbers = data.movers?.climbers || [];
  const fallers = data.movers?.fallers || [];
  const talkers = data.popular || [];
  const monthName = data.month.name || "Måned";
  const monthTop = (data.month.table || []).slice(0, 5);
  const fixtures = (data.pulse?.fixtures || []).filter(
    (row) => row.id && row.home && row.away && row.status,
  );

  return (
    <main className="flex-1">
      <section className="border-b border-ink/10 bg-[#f6e4d8]">
        <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6">
          {status.is_live ? (
            <LiveIndicator gw={status.event_id} live label={status.round_kicker} />
          ) : (
            <p className="font-condensed text-[12px] tracking-[0.16em] text-live uppercase">
              {status.round_kicker || `Runde ${status.event_id}`}
            </p>
          )}
        </div>
      </section>

      {fixtures.length ? (
        <section className="border-b border-rule bg-white/80">
          <div className="mx-auto max-w-[1400px] px-4 py-2.5 sm:px-6">
            <MatchStrip fixtures={fixtures} />
          </div>
        </section>
      ) : null}

      <section className="border-b border-ink/10 bg-[#f6e4d8]">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                  Topp 5 sammenlagt
                </h2>
                <Link href="/liga" className="font-condensed text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">
                  Hele ligaen →
                </Link>
              </div>
              <div className="mt-2">
                <LeagueTable rows={data.top5} status={status} compact />
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between gap-3">
                <h2 className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">{monthName}</h2>
                <Link href="/liga?view=month" className="font-condensed text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">
                  Hele måneden →
                </Link>
              </div>
              <ol className="mt-2">
                {monthTop.map((row) => (
                  <li
                    key={row.entry}
                    className={`flex justify-between border-b border-rule py-1.5 text-sm ${row.entry === entryId ? "font-medium" : ""}`}
                  >
                    <Link href={`/manager/${row.entry}`} className="inline-flex min-h-11 items-center hover:underline">
                      {row.month_rank}. {row.manager}
                    </Link>
                    <span className="font-condensed tabular-nums">{row.month_points}</span>
                  </li>
                ))}
              </ol>
            </section>

            <aside>
              <h2 className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                Spillerne alle snakker om
              </h2>
              <ul className="mt-2 divide-y divide-rule border-y border-rule">
                {talkers.length ? talkers.map((p) => (
                  <li key={p.element} className="flex items-center gap-2.5 py-1.5">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden bg-[#d8d1c4]">
                      <PlayerImage src={p.image_url} alt={p.player} variant="squad" />
                    </div>
                    <p className="min-w-0 flex-1 truncate text-sm">{p.player}</p>
                    <p className="shrink-0 font-condensed text-[11px] tabular-nums text-muted">
                      {Math.round(p.ownership_pct)}% · {p.event_points} p
                    </p>
                  </li>
                )) : (
                  <li className="py-2 text-sm text-muted">Ingen spillere skiller seg ut akkurat nå.</li>
                )}
              </ul>
            </aside>
          </div>
        </div>
      </section>

      {polled.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
          <ApiState title="Viser siste kjente data" message={polled.error} />
        </div>
      ) : null}

      <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.85fr)_minmax(12rem,1fr)] lg:gap-10">
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl">Snakkiser</h2>
            {snakkiser.length ? (
              <ul className="mt-3 divide-y divide-rule border-y border-rule">
                {snakkiser.map((s) => (
                  <li key={s.key}>
                    <Link href={storyHref(s)} className="flex min-h-11 items-baseline gap-3 py-2.5 hover:bg-black/[0.02] sm:gap-4">
                      <span className="w-20 shrink-0 font-condensed text-[11px] tracking-[0.16em] text-live uppercase sm:w-28">
                        {storyCategory(s.category)}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-serif text-lg leading-snug sm:text-xl">{s.headline}</span>
                        {s.meta ? <span className="mt-0.5 block text-sm text-muted">{s.meta}</span> : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-muted">Ingen sterke historier akkurat nå.</p>
            )}
          </section>

          <section>
            <h2 className="font-serif text-2xl">Største utslag</h2>
            <ul className="mt-3 space-y-1">
              <li className="font-condensed text-[11px] tracking-[0.16em] text-[#2f6a32] uppercase">Største klatrere</li>
              {climbers.length ? climbers.map((m) => (
                <li key={m.entry} className="flex justify-between border-b border-rule py-1 text-sm">
                  <Link href={`/manager/${m.entry}`} className="hover:underline">{m.manager}</Link>
                  <span className="font-condensed tabular-nums text-[#2f6a32]">{moveLabel(m.rank_change, status.provisional)}</span>
                </li>
              )) : <li className="text-sm text-muted">Ingen ennå</li>}
            </ul>
            <ul className="mt-4 space-y-1">
              <li className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Største fall</li>
              {fallers.length ? fallers.map((m) => (
                <li key={m.entry} className="flex justify-between border-b border-rule py-1 text-sm">
                  <Link href={`/manager/${m.entry}`} className="hover:underline">{m.manager}</Link>
                  <span className="font-condensed tabular-nums text-live">{moveLabel(m.rank_change, status.provisional)}</span>
                </li>
              )) : <li className="text-sm text-muted">Ingen ennå</li>}
            </ul>
          </section>
        </div>
      </div>
    </main>
  );
}
