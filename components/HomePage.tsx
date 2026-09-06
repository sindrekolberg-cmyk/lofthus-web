"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, storyHref, storyCategory } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { MinLofthus } from "@/components/MinLofthus";
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
  const leader = data.top5[0];
  const thisRound = data.news.filter(
    (s) => !s.source_event || s.source_event === status.event_id,
  );
  const snakkiser = (thisRound.length ? thisRound : data.news).slice(0, 5);
  const me = data.managers.find((m) => m.entry === entryId);
  const climbers = data.movers?.climbers || [];
  const fallers = data.movers?.fallers || [];
  const talkers = [...data.popular]
    .filter((p) => p.event_points > 0 || p.fixture_status === "live")
    .sort((a, b) => b.event_points - a.event_points || b.ownership_count - a.ownership_count)
    .slice(0, 5);
  const liveMatches = data.pulse.fixtures.filter((f) => f.status === "live").length;
  const biggestUp = climbers[0];

  return (
    <main className="flex-1">
      <section className="border-b border-ink/10 bg-[#f6e4d8]">
        <div className="mx-auto max-w-[1400px] px-4 py-4 sm:px-6">
          <h1 className="sr-only">Lofthus Road Open</h1>
          {me ? (
            <p className="mb-3 font-condensed text-[12px] tracking-[0.14em] text-ink uppercase">
              Du er nr. {me.rank} {moveLabel(me.rank_change || 0, status.provisional)}
              {me.players_remaining != null ? ` · ${me.players_remaining} spillere gjenstår` : ""}
            </p>
          ) : null}
          <dl className="flex flex-wrap gap-x-8 gap-y-2 font-condensed text-sm">
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">Leder</dt>
              <dd className="text-base">
                {leader ? (
                  <Link href={`/manager/${leader.entry}`} className="hover:underline">
                    {leader.manager}
                  </Link>
                ) : (
                  "–"
                )}
                {leader ? (
                  <span className="ml-2 tabular-nums text-muted">
                    {leader.total} p
                    {leader.rank_change
                      ? ` · ${moveLabel(leader.rank_change, status.provisional)}`
                      : ""}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">Kamper i spill</dt>
              <dd className="text-lg tabular-nums">{liveMatches}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">Størst løft</dt>
              <dd className="text-lg tabular-nums text-[#2f6a32]">
                {biggestUp ? `${biggestUp.manager.split(" ")[0]} ${moveLabel(biggestUp.rank_change)}` : "–"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">{data.month.name || "Måned"}</dt>
              <dd className="text-lg">{data.month.table[0]?.manager.split(" ")[0] || "–"}</dd>
            </div>
          </dl>
        </div>
      </section>

      {polled.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
          <ApiState title="Viser siste kjente data" message={polled.error} />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12">
        <section className="lg:col-span-8">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-2xl sm:text-3xl">Topp 5 sammenlagt</h2>
            <Link href="/liga" className="font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink">
              Hele ligaen →
            </Link>
          </div>
          <div className="mt-3">
            <LeagueTable rows={data.top5} status={status} compact highlight={entryId} />
          </div>
        </section>

        <section className="lg:col-span-4">
          <h2 className="font-serif text-2xl sm:text-3xl">Spillerne alle snakker om</h2>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {talkers.length ? talkers.map((p) => (
              <li key={p.element} className="flex items-center gap-3 py-2">
                <div className="relative h-10 w-10 shrink-0 overflow-hidden bg-[#d8d1c4]">
                  <PlayerImage src={p.image_url} alt={p.player} variant="squad" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-serif leading-tight">{p.player}</p>
                  <p className="font-condensed text-[11px] text-muted uppercase">
                    {p.event_points} p · {Math.round(p.ownership_pct)}% · {p.fixture_status_label}
                  </p>
                </div>
              </li>
            )) : (
              <li className="py-3 text-sm text-muted">Ingen har spilt ennå.</li>
            )}
          </ul>
        </section>

        <section className="lg:col-span-12">
          <h2 className="font-serif text-2xl">Største utslag</h2>
          <p className="mt-1 text-sm text-muted">
            {status.provisional ? "Foreløpig endring akkurat nå" : "Etter ferdig runde"}
          </p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            <ul className="space-y-1">
              <li className="font-condensed text-[11px] tracking-[0.16em] text-[#2f6a32] uppercase">Største gevinst</li>
              {climbers.length ? climbers.map((m) => (
                <li key={m.entry} className="flex justify-between border-b border-rule py-1.5 text-sm">
                  <Link href={`/manager/${m.entry}`} className="hover:underline">{m.manager}</Link>
                  <span className="font-condensed text-[#2f6a32]">{moveLabel(m.rank_change, status.provisional)}</span>
                </li>
              )) : <li className="text-sm text-muted">Ingen ennå</li>}
            </ul>
            <ul className="space-y-1">
              <li className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Største tap</li>
              {fallers.length ? fallers.map((m) => (
                <li key={m.entry} className="flex justify-between border-b border-rule py-1.5 text-sm">
                  <Link href={`/manager/${m.entry}`} className="hover:underline">{m.manager}</Link>
                  <span className="font-condensed text-live">{moveLabel(m.rank_change, status.provisional)}</span>
                </li>
              )) : <li className="text-sm text-muted">Ingen ennå</li>}
            </ul>
          </div>
        </section>

        <section className="lg:col-span-7">
          <h2 className="font-serif text-2xl">Snakkiser</h2>
          <ul className="mt-3 divide-y divide-rule border-y border-rule">
            {snakkiser.map((s) => (
              <li key={s.key}>
                <Link href={storyHref(s)} className="flex items-baseline gap-3 py-2 hover:bg-black/[0.02]">
                  <span className="w-28 shrink-0 font-condensed text-[10px] tracking-[0.14em] text-muted uppercase">
                    {storyCategory(s.category)}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm leading-snug">{s.headline}</span>
                    {s.meta ? <span className="block text-xs text-muted">{s.meta}</span> : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-5">
          <h2 className="font-serif text-2xl">{data.month.name || "Måned"}</h2>
          <ol className="mt-3">
            {data.month.table.map((row) => (
              <li key={row.entry} className="flex justify-between border-b border-rule py-1.5 text-sm">
                <Link href={`/manager/${row.entry}`} className="hover:underline">
                  {row.month_rank}. {row.manager}
                </Link>
                <span className="font-condensed tabular-nums">{row.month_points}</span>
              </li>
            ))}
          </ol>
          <Link href="/liga?view=month" className="mt-3 inline-block font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink">
            Hele måneden →
          </Link>
          <p className="mt-6 font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">Analyse</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/analyse/rivalradar" className="hover:underline">Rivalradar</Link>
            </li>
            <li>
              <Link href="/analyse/differensialer" className="hover:underline">Differensialer</Link>
            </li>
            <li>
              <Link href="/analyse/kaptein" className="hover:underline">Kapteiner</Link>
            </li>
          </ul>
        </section>
      </div>

      <MinLofthus managers={data.managers} status={status} stories={data.news} />
    </main>
  );
}
