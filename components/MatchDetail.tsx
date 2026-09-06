"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signed, ownersLabel, captainsLabel } from "@/lib/format";
import type { MatchImpact } from "@/lib/types";
import { LoadingBlock } from "@/components/ApiState";
import { fixtureStatusLabel, isFixtureLive, isPlayerUpcoming } from "@/lib/status";

function ownerMark(owner: {
  is_captain: boolean;
  is_triple_captain: boolean;
  on_bench?: boolean;
}) {
  if (owner.is_triple_captain) return "TC";
  if (owner.is_captain) return "C";
  if (owner.on_bench) return "Benk";
  return "";
}

export function MatchDetail({
  fixtureId,
  data,
  loading,
  error,
  onClose,
}: {
  fixtureId?: number;
  data: MatchImpact | null;
  loading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [openPlayer, setOpenPlayer] = useState<number | null>(null);
  const fixture = data?.fixture?.id === fixtureId || !fixtureId ? data?.fixture : undefined;
  const live = isFixtureLive(fixture?.status);
  const status = fixtureStatusLabel(fixture?.status, fixture?.status_label);

  useEffect(() => {
    setOpenPlayer(null);
  }, [fixtureId]);

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
    ? `${fixture.home_name || fixture.home} ${fixture.home_score ?? "–"}–${fixture.away_score ?? "–"} ${fixture.away_name || fixture.away}`
    : "";

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
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
        data-fixture-id={fixtureId || fixture?.id || ""}
        className="relative z-[101] max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-ink bg-paper p-5 shadow-xl sm:max-h-[88vh] sm:max-w-2xl sm:rounded-none sm:p-8"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1.25rem, env(safe-area-inset-left))",
          paddingRight: "max(1.25rem, env(safe-area-inset-right))",
        }}
      >
        <button
          ref={closeRef}
          type="button"
          className="absolute right-3 top-3 min-h-11 min-w-11 font-condensed text-[12px] tracking-[0.16em] uppercase text-muted hover:text-ink"
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
            <p className={`font-condensed text-[11px] tracking-[0.18em] uppercase ${live ? "text-live" : "text-muted"}`}>
              {status}
              {live && fixture.minutes ? ` · ${fixture.minutes}'` : ""}
            </p>
            <h2 id="match-detail-title" className="mt-2 pr-16 font-serif text-2xl leading-tight sm:text-4xl">
              {score}
            </h2>

            <section className="mt-6 border-t border-ink pt-5">
              <h3 className="font-condensed text-[12px] tracking-[0.16em] uppercase">Lofthus-puls</h3>
              <p className="mt-2 text-sm text-muted">
                {ownersLabel(data?.owners || 0)} berørt
                {data?.captains ? ` · ${captainsLabel(data.captains)}` : ""}
                {data?.triple_captains ? ` · ${data.triple_captains} TC` : ""}
              </p>
            </section>

            <h3 className="mt-8 font-condensed text-[12px] tracking-[0.16em] uppercase">Spillere</h3>
            <ul className="mt-3 divide-y divide-rule border-y border-rule">
              {(data?.players || []).map((player) => {
                const expanded = openPlayer === player.element;
                return (
                  <li key={player.element} className="py-3">
                    <button
                      type="button"
                      className="flex min-h-11 w-full items-start justify-between gap-3 text-left"
                      onClick={() => setOpenPlayer(expanded ? null : player.element)}
                      aria-expanded={expanded}
                    >
                      <span>
                        <span className="block font-serif text-lg leading-tight sm:text-xl">{player.player}</span>
                        <span className="mt-1 block text-sm text-muted">
                          {isPlayerUpcoming(player.fixture_status) ? "ikke spilt" : `${player.event_points} p`}
                          {" · "}
                          {ownersLabel(player.ownership_count)}
                          {player.captain_count ? ` · ${player.captain_count} C` : ""}
                          {player.triple_captain_count ? ` · ${player.triple_captain_count} TC` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
                        {expanded ? "Lukk" : "Eiere"}
                      </span>
                    </button>
                    {expanded ? (
                      <ul className="mt-2 space-y-1 border-t border-rule pt-2">
                        {(player.owners || []).map((owner) => (
                          <li key={owner.entry} className="flex min-h-11 items-baseline justify-between gap-3 text-sm">
                            <Link href={`/manager/${owner.entry}`} className="hover:underline">
                              {owner.manager}
                              {owner.team ? <span className="text-muted"> · {owner.team}</span> : null}
                            </Link>
                            <span className="font-condensed text-[11px] tracking-[0.14em] text-live uppercase">
                              {ownerMark(owner)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>

            <h3 className="mt-8 font-condensed text-[12px] tracking-[0.16em] text-[#2f6a32] uppercase">
              Tjener mest på kampen
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

            {(data?.losers || []).length ? (
              <>
                <h3 className="mt-8 font-condensed text-[12px] tracking-[0.16em] text-live uppercase">
                  Taper mest på kampen
                </h3>
                <ul className="mt-3 space-y-2">
                  {(data?.losers || []).map((row) => (
                    <li key={row.entry} className="flex justify-between gap-3">
                      <Link href={`/manager/${row.entry}`} className="hover:underline">
                        {row.manager}
                      </Link>
                      <span className="font-condensed text-live">{signed(row.swing)}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
