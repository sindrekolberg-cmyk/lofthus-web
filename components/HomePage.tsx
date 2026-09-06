"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, storyHref, storyCategory } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { LiveIndicator } from "@/components/LiveIndicator";
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
  const pulse = data.hero?.story;
  const snakkiser = data.news.slice(0, 5);
  const me = data.managers.find((m) => m.entry === entryId);
  const climbers = data.movers?.climbers || [];
  const fallers = data.movers?.fallers || [];
  const talkers = data.popular || [];
  const pulseLine = pulse?.headline
    || (leader ? `${leader.manager} leder · ${leader.total} p` : "Det skjer i Lofthus");

  return (
    <main className="flex-1">
      <section className="border-b border-ink/10 bg-[#f6e4d8]">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:py-5">
          <div className="lg:col-span-8">
            {status.is_live ? (
              <LiveIndicator gw={status.event_id} live label={status.round_kicker} />
            ) : (
              <p className="font-condensed text-[12px] tracking-[0.16em] text-live uppercase">
                {status.round_kicker || `Runde ${status.event_id}`}
              </p>
            )}
            <h1 className="mt-2 max-w-2xl font-serif text-[1.15rem] leading-snug text-ink sm:text-[1.35rem]">
              {pulseLine}
            </h1>
            {pulse?.meta ? <p className="mt-1 text-sm text-muted">{pulse.meta}</p> : null}
            {me ? (
              <p className="mt-2 font-condensed text-[11px] tracking-[0.12em] text-muted uppercase">
                Du er nr. {me.rank} {moveLabel(me.rank_change || 0, status.provisional)}
                {me.players_remaining != null ? ` · ${me.players_remaining} spillere gjenstår` : ""}
              </p>
            ) : null}

            <div className="mt-4 flex items-end justify-between">
              <h2 className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">Topp 5 sammenlagt</h2>
              <Link href="/liga" className="font-condensed text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink">
                Hele ligaen →
              </Link>
            </div>
            <div className="mt-2">
              <LeagueTable rows={data.top5} status={status} compact highlight={entryId} />
            </div>
          </div>

          <aside className="lg:col-span-4">
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
                <li className="py-2 text-sm text-muted">Ingen har spilt ennå.</li>
              )}
            </ul>
          </aside>
        </div>
      </section>

      {polled.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
          <ApiState title="Viser siste kjente data" message={polled.error} />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12">
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
