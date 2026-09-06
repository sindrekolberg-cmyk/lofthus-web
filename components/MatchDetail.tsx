"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { signed, ownersLabel, captainsLabel } from "@/lib/format";
import type { MatchImpact } from "@/lib/types";
import { LoadingBlock } from "@/components/ApiState";

export function MatchDetail({
  data,
  loading,
  error,
  onClose,
}: {
  data: MatchImpact | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const fixture = data?.fixture;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = original;
      previous?.focus();
    };
  }, [onClose]);

  const score = fixture
    ? `${fixture.home} ${fixture.home_score ?? "–"}–${fixture.away_score ?? "–"} ${fixture.away}`
    : "";

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-ink/40"
        aria-label="Lukk kampdetalj"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-detail-title"
        className="relative z-[81] max-h-[92vh] w-full overflow-y-auto border border-ink bg-paper p-5 shadow-xl sm:max-w-2xl sm:p-8"
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute right-4 top-4 min-h-11 font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
          onClick={onClose}
        >
          Lukk
        </button>
        {loading && !data ? <LoadingBlock label="Henter kampen…" /> : null}
        {error && !data ? (
          <p className="pr-16 text-sm text-muted">{error}</p>
        ) : null}
        {fixture ? (
          <>
            <p className="font-condensed text-[11px] tracking-[0.18em] text-live uppercase">
              {fixture.status_label}
              {fixture.minutes ? ` · ${fixture.minutes}'` : ""}
            </p>
            <h2 id="match-detail-title" className="mt-2 font-serif text-3xl sm:text-4xl">
              {score}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {fixture.home_name} mot {fixture.away_name}
            </p>

            <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-ink pt-5 sm:grid-cols-4">
              <div>
                <dt className="text-xs text-muted">Tjener mest</dt>
                <dd className="font-serif text-xl">
                  {data?.biggest_winner ? (
                    <Link href={`/manager/${data.biggest_winner.entry}`} className="hover:underline">
                      {data.biggest_winner.manager}
                    </Link>
                  ) : (
                    "–"
                  )}
                </dd>
                <dd className="font-condensed text-sm text-[#2f6a32]">
                  {data?.biggest_winner ? signed(data.biggest_winner.swing) : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Taper mest</dt>
                <dd className="font-serif text-xl">
                  {data?.biggest_loser ? (
                    <Link href={`/manager/${data.biggest_loser.entry}`} className="hover:underline">
                      {data.biggest_loser.manager}
                    </Link>
                  ) : (
                    "–"
                  )}
                </dd>
                <dd className="font-condensed text-sm text-live">
                  {data?.biggest_loser ? signed(data.biggest_loser.swing) : ""}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Eiere</dt>
                <dd className="font-condensed text-2xl">{data?.owners ?? 0}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Kapteiner</dt>
                <dd className="font-condensed text-2xl">{data?.captains ?? 0}</dd>
              </div>
            </dl>

            <h3 className="mt-8 font-condensed text-[12px] tracking-[0.16em] uppercase">Spillere i Lofthus</h3>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {(data?.players || []).map((player) => {
                const lead = player.owners[0];
                return (
                  <li key={player.element} className="py-3">
                    <p className="font-serif text-xl">{player.player}</p>
                    <p className="text-sm text-muted">
                      {player.fixture_status === "not_started"
                        ? "ikke spilt"
                        : `${player.event_points} poeng`}
                      {" · "}
                      {ownersLabel(player.ownership_count)}
                      {player.captain_count ? ` · ${captainsLabel(player.captain_count)}` : ""}
                      {player.differential ? " · differensial" : ""}
                    </p>
                    {lead ? (
                      <p className="mt-1 text-sm">
                        {player.event_points
                          ? `${lead.manager} tjener mest på ${player.player}`
                          : `${player.ownership_count === 1 ? "1 manager eier" : `${player.ownership_count} managere eier`} ${player.player}`}
                      </p>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <div className="mt-8 grid gap-8 sm:grid-cols-2">
              <section>
                <h3 className="font-condensed text-[12px] tracking-[0.16em] text-[#2f6a32] uppercase">
                  Hvem tjener
                </h3>
                <ul className="mt-3 space-y-2">
                  {(data?.winners || []).length ? (
                    data?.winners.map((row) => (
                      <li key={row.entry} className="flex justify-between gap-3">
                        <Link href={`/manager/${row.entry}`} className="hover:underline">
                          {row.manager}
                        </Link>
                        <span className="font-condensed text-[#2f6a32]">{signed(row.swing)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted">Ingen tydelig gevinst ennå.</li>
                  )}
                </ul>
              </section>
              <section>
                <h3 className="font-condensed text-[12px] tracking-[0.16em] text-live uppercase">
                  Hvem taper
                </h3>
                <ul className="mt-3 space-y-2">
                  {(data?.losers || []).length ? (
                    data?.losers.map((row) => (
                      <li key={row.entry} className="flex justify-between gap-3">
                        <Link href={`/manager/${row.entry}`} className="hover:underline">
                          {row.manager}
                        </Link>
                        <span className="font-condensed text-live">{signed(row.swing)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted">Ingen tydelig tap ennå.</li>
                  )}
                </ul>
              </section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
