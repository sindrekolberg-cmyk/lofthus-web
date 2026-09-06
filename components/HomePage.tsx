"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, storyHref, storyCategory } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
import { MatchStrip } from "@/components/MatchStrip";
import { MinLofthus } from "@/components/MinLofthus";
import { PlayerImage } from "@/components/PlayerImage";
import { useSelectedManager } from "@/lib/selected-manager";

export function HomePage() {
  const { entryId } = useSelectedManager();
  const polled = useLofthus("home", () => api.home(), {
    refreshInterval: (latest) => (latest?.status.is_live ? 20_000 : 180_000),
  });
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
  const story = data.hero?.story;
  const leader = data.top5[0];
  const liveLead =
    status.is_live && leader
      ? leader.rank_change > 0
        ? `${leader.manager} har tatt over tabelltoppen live`
        : `${leader.manager} ligger an til tabelltoppen`
      : story?.headline || "Det skjer i Lofthus";
  const liveFacts =
    status.is_live && leader
      ? `${leader.total} poeng${
          leader.rank_change
            ? ` · foreløpig ${leader.rank_change > 0 ? "opp" : "ned"} ${Math.abs(leader.rank_change)} plasser`
            : ""
        }`
      : story?.meta || `${status.league_size} managere`;
  const snakkiser = data.news
    .filter((s) => s.key !== story?.key)
    .filter((s) => !/(måned|month)/i.test(s.category || ""))
    .slice(0, 2);
  const climbers = data.movers?.climbers || [];
  const fallers = data.movers?.fallers || [];

  return (
    <main className="flex-1">
      <section className="bg-[#e24b32] text-paper">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
          {status.is_live ? (
            <LiveIndicator gw={status.event_id} live tone="paper" />
          ) : (
            <p className="font-condensed text-[12px] tracking-[0.22em] uppercase">
              {status.event_status_label} · runde {status.event_id}
            </p>
          )}
          <h1 className="mt-2 max-w-3xl font-serif text-[1.75rem] leading-[1.1] sm:text-4xl">
            {liveLead}
          </h1>
          <p className="mt-2 font-condensed text-sm tracking-wide sm:text-base">{liveFacts}</p>
        </div>
      </section>

      <section className="border-b border-rule bg-white/70">
        <div className="mx-auto max-w-[1400px] px-4 py-3 sm:px-6">
          <MatchStrip fixtures={data.pulse.fixtures} />
        </div>
      </section>

      {polled.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
          <ApiState title="Viser siste kjente data" message={polled.error} />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl">Topp 5 sammenlagt</h2>
            <Link href="/liga" className="font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink">
              Hele ligaen →
            </Link>
          </div>
          <div className="mt-4">
            <LeagueTable rows={data.top5} status={status} compact highlight={entryId} />
          </div>
        </section>

        <section className="lg:col-span-5">
          <h2 className="font-serif text-3xl">Største utslag</h2>
          <p className="mt-1 text-sm text-muted">
            {status.provisional ? "Foreløpig endring akkurat nå" : "Etter ferdig runde"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-condensed text-[11px] tracking-[0.16em] text-[#2f6a32] uppercase">
                Største gevinst
              </p>
              <ul className="mt-2 space-y-2">
                {climbers.length ? climbers.map((m) => (
                  <li key={m.entry}>
                    <Link href={`/manager/${m.entry}`} className="hover:underline">
                      {m.manager}
                    </Link>
                    <span className="ml-2 font-condensed text-[#2f6a32]">
                      {moveLabel(m.rank_change, status.provisional)}
                    </span>
                  </li>
                )) : <li className="text-sm text-muted">Ingen ennå</li>}
              </ul>
            </div>
            <div>
              <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Største tap</p>
              <ul className="mt-2 space-y-2">
                {fallers.length ? fallers.map((m) => (
                  <li key={m.entry}>
                    <Link href={`/manager/${m.entry}`} className="hover:underline">
                      {m.manager}
                    </Link>
                    <span className="ml-2 font-condensed text-live">
                      {moveLabel(m.rank_change, status.provisional)}
                    </span>
                  </li>
                )) : <li className="text-sm text-muted">Ingen ennå</li>}
              </ul>
            </div>
          </div>
        </section>

        <section className="lg:col-span-7">
          <h2 className="font-serif text-3xl">Snakkiser</h2>
          <ul className="mt-4 space-y-3">
            {snakkiser.map((s) => (
              <li key={s.key} className="border-b border-rule pb-3">
                <Link href={storyHref(s)} className="block hover:underline">
                  <p className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                    {storyCategory(s.category)}
                  </p>
                  <p className="mt-1 font-serif text-2xl">{s.headline}</p>
                  <p className="mt-1 text-sm text-muted">{s.meta}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-5">
          <h2 className="font-serif text-3xl">{data.month.name || "Måned"}</h2>
          <ol className="mt-4">
            {data.month.table.map((row) => (
              <li key={row.entry} className="flex justify-between border-b border-rule py-2">
                <Link href={`/manager/${row.entry}`} className="hover:underline">
                  {row.month_rank}. {row.manager}
                </Link>
                <span className="font-condensed tabular-nums">{row.month_points}</span>
              </li>
            ))}
          </ol>
          <Link href="/liga?view=month" className="mt-4 inline-block font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink">
            Hele måneden →
          </Link>
        </section>
      </div>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
          <h2 className="font-serif text-3xl">Mest eid</h2>
          <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {data.popular.slice(0, 6).map((p) => (
              <li key={p.element} className="flex items-center gap-3 border border-rule bg-white/40 p-2">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-[#d8d1c4]">
                  <PlayerImage src={p.image_url} alt={p.player} variant="squad" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-serif leading-tight">{p.player}</p>
                  <p className="font-condensed text-[11px] text-muted uppercase">
                    {Math.round(p.ownership_pct)}% · {p.fixture_status === "not_started" ? "ikke spilt" : `${p.event_points} p`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MinLofthus managers={data.managers} status={status} stories={data.news} />
    </main>
  );
}
