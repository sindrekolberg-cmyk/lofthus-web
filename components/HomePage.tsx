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
  const leader = data.top5[0];
  const liveLead =
    status.is_live && leader
      ? leader.rank_change > 0
        ? `${leader.manager} har tatt over tabelltoppen live`
        : `${leader.manager} ligger an til tabelltoppen`
      : status.provisional && leader
        ? `${leader.manager} leder etter GW${status.event_id}`
        : data.hero?.story?.headline || "Det skjer i Lofthus";
  const liveFacts =
    leader
      ? `${leader.total} poeng${
          leader.rank_change
            ? ` · ${status.provisional ? "foreløpig" : ""} ${leader.rank_change > 0 ? "opp" : "ned"} ${Math.abs(leader.rank_change)} plasser`.replace("  ", " ")
            : ""
        }`
      : `${status.league_size} managere`;
  const thisRound = data.news.filter(
    (s) => !s.source_event || s.source_event === status.event_id,
  );
  const snakkiser = (thisRound.length ? thisRound : data.news).slice(0, 6);
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
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 sm:py-6">
          {status.is_live ? (
            <LiveIndicator gw={status.event_id} live />
          ) : (
            <p className="font-condensed text-[12px] tracking-[0.18em] text-live uppercase">
              {status.provisional
                ? `Runde ${status.event_id} · poengene er foreløpige`
                : `Runde ${status.event_id} · ${status.event_status_label}`}
            </p>
          )}
          <h1 className="mt-2 max-w-3xl font-serif text-[1.65rem] leading-[1.12] text-ink sm:text-[2.1rem]">
            {liveLead}
          </h1>
          <p className="mt-2 text-sm text-muted">{liveFacts}</p>
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-2 font-condensed text-sm">
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">Kamper i spill</dt>
              <dd className="text-lg tabular-nums">{liveMatches}</dd>
            </div>
            <div>
              <dt className="text-[10px] tracking-[0.16em] text-muted uppercase">Ledelse</dt>
              <dd className="text-lg tabular-nums">{leader ? `${leader.total} p` : "–"}</dd>
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
          <h2 className="font-serif text-2xl sm:text-3xl">Alle snakker om</h2>
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
