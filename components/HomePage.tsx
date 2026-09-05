"use client";

import Link from "next/link";
import { api } from "@/lib/api";
import { useLofthus } from "@/lib/useLofthus";
import { moveLabel, signed, storyHref } from "@/lib/format";
import { ApiState, LoadingBlock } from "@/components/ApiState";
import { LeagueTable } from "@/components/LeagueTable";
import { MinLofthus } from "@/components/MinLofthus";
import { PlayerImage } from "@/components/PlayerImage";
import { analysisEntries } from "@/lib/types";
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
            <ApiState title="Forsiden venter på motoren" message={polled.error} />
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
  const player = data.hero?.player;

  const snakkiser = data.news
    .filter((s) => s.key !== story?.key)
    .filter((s) => !/(måned|month)/i.test(s.category || ""))
    .slice(0, 3);
  const climbers = data.movers?.climbers || [];
  const fallers = data.movers?.fallers || [];

  return (
    <main className="flex-1">
      <section className="bg-[#e24b32] text-paper">
        <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:py-10">
          <div className="lg:col-span-7">
            <p className="font-condensed text-[12px] tracking-[0.22em] uppercase">
              {status.is_live ? "Live nå" : status.event_status_label} · GW{status.event_id}
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-[0.95] sm:text-6xl">
              {story?.headline || "Det skjer i Lofthus"}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-paper/85 sm:text-base">
              {story?.meta ||
                `${status.league_size} managere. ${status.month_name || ""} er aktiv måned.`}
            </p>
            {player ? (
              <p className="mt-4 font-condensed text-sm tracking-wide uppercase">
                {player.player} {player.event_points} · {player.ownership_count} eiere
                {player.captain_count ? ` · ${player.captain_count} kaptein` : ""}
              </p>
            ) : null}
          </div>
          <div className="flex items-end gap-4 lg:col-span-5">
            {player ? (
              <div className="relative h-36 w-28 shrink-0 overflow-hidden bg-black/20 sm:h-44 sm:w-32">
                <PlayerImage src={player.image_url} alt={player.player} variant="hero" priority />
              </div>
            ) : null}
            <ol className="min-w-0 flex-1">
              {data.top5.slice(0, 5).map((row) => (
                <li
                  key={row.entry}
                  className="flex items-baseline justify-between gap-3 border-b border-white/20 py-1.5 font-condensed"
                >
                  <Link href={`/manager/${row.entry}`} className="truncate hover:underline">
                    {row.rank}. {row.manager}
                  </Link>
                  <span className="tabular-nums">{row.total}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-white/50">
        <div className="mx-auto flex max-w-[1400px] gap-6 overflow-x-auto px-4 py-3 sm:px-6">
          {data.pulse.fixtures.map((f) => (
            <div key={f.id} className="min-w-[11rem] shrink-0">
              <p className="font-condensed text-sm">
                {f.home} {f.home_score ?? "–"}–{f.away_score ?? "–"} {f.away}
              </p>
              <p className="text-[11px] text-muted">
                {f.lofthus_headline || f.status_label}
                {f.lofthus_owners
                  ? ` · ${f.lofthus_owners} eiere${f.lofthus_captains ? ` · ${f.lofthus_captains} C` : ""}`
                  : ""}
                {f.lofthus_winner
                  ? ` · ${f.lofthus_winner.manager} ${signed(f.lofthus_winner.swing)}`
                  : ""}
              </p>
            </div>
          ))}
        </div>
      </section>

      {polled.error ? (
        <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
          <ApiState title="Viser siste kjente data" message={polled.error} />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-12">
        <section className="lg:col-span-7">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-3xl">Topp 5</h2>
            <Link href="/liga" className="font-condensed text-[12px] tracking-[0.14em] uppercase text-muted hover:text-ink">
              Hele ligaen →
            </Link>
          </div>
          <div className="mt-4">
            <LeagueTable rows={data.top5} status={status} compact highlight={entryId} />
          </div>
        </section>

        <section className="lg:col-span-5">
          <h2 className="font-serif text-3xl">Movers</h2>
          <p className="mt-1 text-sm text-muted">
            {status.provisional ? "Foreløpig live-sving" : "Etter ferdig runde"}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="font-condensed text-[11px] tracking-[0.16em] text-[#2f6a32] uppercase">
                Klatrer
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
              <p className="font-condensed text-[11px] tracking-[0.16em] text-live uppercase">Faller</p>
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
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {snakkiser.map((s, i) => (
              <li key={s.key} className={i === 0 ? "sm:col-span-2 border border-ink p-5" : "border border-rule p-4"}>
                <Link href={storyHref(s)} className="block hover:underline">
                  <p className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
                    {s.category}
                  </p>
                  <p className={`mt-1 font-serif ${i === 0 ? "text-3xl" : "text-xl"}`}>{s.headline}</p>
                  <p className="mt-2 text-sm text-muted">{s.meta}</p>
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
            Månedstabell →
          </Link>
        </section>
      </div>

      <section className="border-t border-rule">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
          <h2 className="font-serif text-3xl">Spillerne alle snakker om</h2>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-6">
            {data.popular.slice(0, 6).map((p) => (
              <li key={p.element} className="relative aspect-[3/4] overflow-hidden bg-[#d8d1c4]">
                <PlayerImage src={p.image_url} alt={p.player} variant="card" />
                <div className="absolute inset-x-0 bottom-0 bg-ink/80 p-2 text-paper">
                  <p className="font-serif text-sm leading-tight">{p.player}</p>
                  <p className="font-condensed text-[10px] uppercase tracking-wide text-paper/70">
                    {Math.round(p.ownership_pct)}% · {p.fixture_status === "not_started" ? "ikke spilt" : `${p.event_points} p`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <MinLofthus managers={data.managers} status={status} stories={data.news} />

      <section className="border-t border-rule">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
          <h2 className="font-serif text-3xl">Analyse</h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysisEntries.map((e) => (
              <li key={e.href} className="border border-rule p-5">
                <Link href={e.href} className="block hover:underline">
                  <p className="font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">{e.kicker}</p>
                  <p className="mt-1 font-serif text-2xl">{e.title}</p>
                  <p className="mt-2 text-sm text-muted">{e.line}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
