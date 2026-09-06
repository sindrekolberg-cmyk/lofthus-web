"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { PlayerCard, PlayerOwner } from "@/lib/types";
import { leagueOwnership } from "@/lib/format";
import { fixtureStatusLabel, isFixtureFinished, isFixtureLive, isFixtureUpcoming } from "@/lib/status";

type SortKey = "player" | "club" | "ownership" | "gw" | "status";
type FilterKey = "all" | "live" | "upcoming" | "finished";

const SORTS: { id: SortKey; label: string }[] = [
  { id: "ownership", label: "Eierandel" },
  { id: "player", label: "Spiller" },
  { id: "club", label: "Klubb" },
  { id: "gw", label: "GW" },
  { id: "status", label: "Status" },
];

const FILTERS: { id: FilterKey; label: string }[] = [
  { id: "all", label: "Alle" },
  { id: "live", label: "Pågår" },
  { id: "upcoming", label: "Ikke startet" },
  { id: "finished", label: "Ferdig" },
];

function ownerBadge(owner: PlayerOwner) {
  if (owner.is_triple_captain) return "TC";
  if (owner.is_captain) return "C";
  if (owner.on_bench) return "Benk";
  return "";
}

function OwnerNames({ owners }: { owners: PlayerOwner[] }) {
  if (owners.length === 1) return <span>{owners[0].manager}</span>;
  if (owners.length === 2) return <span>{owners.map((o) => o.manager).join(", ")}</span>;
  return <span className="font-condensed tracking-[0.12em] uppercase">{owners.length} eiere →</span>;
}

export function OwnershipTable({
  players,
  leagueSize,
}: {
  players: PlayerCard[];
  leagueSize: number;
}) {
  const [sort, setSort] = useState<SortKey>("ownership");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [open, setOpen] = useState<PlayerCard | null>(null);

  const rows = useMemo(() => {
    const copy = players.filter((p) => {
      if (filter === "live") return isFixtureLive(p.fixture_status);
      if (filter === "upcoming") return isFixtureUpcoming(p.fixture_status);
      if (filter === "finished") return isFixtureFinished(p.fixture_status);
      return true;
    });
    copy.sort((a, b) => {
      if (sort === "player") return a.player.localeCompare(b.player, "nb");
      if (sort === "club") return a.club.localeCompare(b.club, "nb") || a.player.localeCompare(b.player, "nb");
      if (sort === "gw") return b.event_points - a.event_points || b.ownership_count - a.ownership_count;
      if (sort === "status") {
        return fixtureStatusLabel(a.fixture_status, a.fixture_status_label).localeCompare(
          fixtureStatusLabel(b.fixture_status, b.fixture_status_label),
          "nb",
        );
      }
      return b.ownership_count - a.ownership_count || b.captain_count - a.captain_count || a.player.localeCompare(b.player, "nb");
    });
    return copy;
  }, [players, sort, filter]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`min-h-11 border px-3 font-condensed text-[11px] tracking-[0.14em] uppercase ${
              filter === item.id ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="mb-3 hidden gap-2 md:flex">
        {SORTS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSort(item.id)}
            className={`min-h-11 border px-3 font-condensed text-[11px] tracking-[0.14em] uppercase ${
              sort === item.id ? "border-ink text-ink" : "border-rule text-muted hover:border-ink hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto md:overflow-visible">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
              <th className="py-3 pr-3 font-medium">Spiller</th>
              <th className="hidden py-3 pr-3 font-medium md:table-cell">Klubb</th>
              <th className="py-3 pr-3 font-medium">Eierandel i ligaen</th>
              <th className="hidden py-3 pr-3 font-medium lg:table-cell">Eiere</th>
              <th className="py-3 pr-3 text-right font-medium">GW</th>
              <th className="py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const owners = p.owners || [];
              const size = p.league_size || leagueSize;
              const status = fixtureStatusLabel(p.fixture_status, p.fixture_status_label);
              return (
                <tr key={p.element} className="border-b border-rule hover:bg-black/[0.03]">
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      className="min-h-11 text-left"
                      onClick={() => setOpen(p)}
                    >
                      <span className="block text-[0.95rem] leading-tight">{p.player}</span>
                      <span className="block text-xs text-muted md:hidden">{p.club}</span>
                    </button>
                  </td>
                  <td className="hidden py-2 pr-3 text-sm text-muted md:table-cell">{p.club}</td>
                  <td className="py-2 pr-3 font-condensed text-sm tabular-nums">
                    {leagueOwnership(p.ownership_pct, p.ownership_count, size)}
                  </td>
                  <td className="hidden py-2 pr-3 text-sm lg:table-cell">
                    <button type="button" className="min-h-11 text-left" onClick={() => setOpen(p)}>
                      <OwnerNames owners={owners} />
                    </button>
                  </td>
                  <td className="py-2 pr-3 text-right font-condensed text-lg tabular-nums">{p.event_points}</td>
                  <td className="py-2 text-sm">{status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Lukk eiere" onClick={() => setOpen(null)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ownership-detail-title"
            className="relative z-[81] max-h-[88dvh] w-full overflow-y-auto rounded-t-2xl border border-ink bg-paper p-5 shadow-xl sm:max-w-lg sm:rounded-none sm:p-8"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <button
              type="button"
              className="absolute right-3 top-3 min-h-11 min-w-11 font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
              onClick={() => setOpen(null)}
            >
              Lukk
            </button>
            <p className="font-condensed text-[11px] tracking-[0.18em] text-live uppercase">
              {open.club} · {fixtureStatusLabel(open.fixture_status, open.fixture_status_label)}
            </p>
            <h2 id="ownership-detail-title" className="mt-2 font-serif text-3xl leading-none">
              {open.player}
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink pt-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted">GW</dt>
                <dd className="font-condensed text-2xl tabular-nums">{open.event_points}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Eierandel</dt>
                <dd className="font-condensed text-2xl tabular-nums">
                  {Number(open.ownership_pct).toLocaleString("nb-NO", { maximumFractionDigits: 1 })}%
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Kapteiner</dt>
                <dd className="font-condensed text-2xl tabular-nums">{open.captain_count}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Effektivt</dt>
                <dd className="font-condensed text-2xl tabular-nums">
                  {Math.round(open.effective_ownership_pct)}%
                </dd>
              </div>
            </dl>
            <h3 className="mt-6 font-condensed text-[12px] tracking-[0.16em] uppercase">
              Eiere av {open.player}
            </h3>
            <p className="mt-1 text-sm text-muted">
              {leagueOwnership(open.ownership_pct, open.ownership_count, open.league_size || leagueSize)}
              {open.triple_captain_count ? ` · ${open.triple_captain_count} TC` : ""}
            </p>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {(open.owners || []).map((owner) => (
                <li key={owner.entry} className="flex min-h-11 items-baseline justify-between gap-3 py-2">
                  <Link href={`/manager/${owner.entry}`} className="hover:underline">
                    <span className="block">{owner.manager}</span>
                    <span className="block text-xs text-muted">{owner.team}</span>
                  </Link>
                  <span className="font-condensed text-[11px] tracking-[0.14em] text-live uppercase">
                    {ownerBadge(owner)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
      {!rows.length ? <p className="mt-4 text-sm text-muted">Ingen spillere i dette utvalget.</p> : null}
    </div>
  );
}
