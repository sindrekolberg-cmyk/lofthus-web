"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ManagerRow, Status } from "@/lib/types";
import { moveLabel } from "@/lib/format";

type SortKey = "total" | "gw" | "month" | "up" | "down";

type Props = {
  rows: ManagerRow[];
  status: Status | null;
  compact?: boolean;
  highlight?: number;
  remaining?: boolean;
  sortable?: boolean;
};

const SORTS: { id: SortKey; label: string }[] = [
  { id: "total", label: "Totalpoeng" },
  { id: "gw", label: "Rundepoeng" },
  { id: "month", label: "Måned" },
  { id: "up", label: "Største klatrere" },
  { id: "down", label: "Største fall" },
];

export function LeagueTable({ rows, status, compact, highlight, remaining, sortable }: Props) {
  const provisional = Boolean(status?.provisional);
  const [sort, setSort] = useState<SortKey>("total");
  const prevTops = useRef(new Map<number, number>());
  const prevRanks = useRef(new Map<number, number>());

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sort === "total") return b.total - a.total || a.rank - b.rank;
      if (sort === "gw") return b.gw - a.gw || a.rank - b.rank;
      if (sort === "month") return b.month_points - a.month_points || a.rank - b.rank;
      if (sort === "up") return b.rank_change - a.rank_change || a.rank - b.rank;
      if (sort === "down") return a.rank_change - b.rank_change || a.rank - b.rank;
      return b.total - a.total || a.rank - b.rank;
    });
    return copy;
  }, [rows, sort]);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const nextTops = new Map<number, number>();
    sorted.forEach((row) => {
      const el = document.querySelector<HTMLElement>(`tr[data-entry="${row.entry}"]`);
      if (!el) return;
      const top = el.getBoundingClientRect().top;
      const prev = prevTops.current.get(row.entry);
      const prevRank = prevRanks.current.get(row.entry);
      nextTops.set(row.entry, top);
      if (prev != null && Math.abs(prev - top) > 2) {
        const dy = prev - top;
        el.style.transform = `translateY(${dy}px)`;
        el.style.transition = "none";
        requestAnimationFrame(() => {
          el.style.transition = "transform 0.75s ease, background-color 1.2s ease";
          el.style.transform = "";
        });
      }
      if (prevRank != null && prevRank !== row.rank) {
        el.classList.remove("row-up", "row-down");
        el.classList.add(row.rank < prevRank ? "row-up" : "row-down");
        window.setTimeout(() => el.classList.remove("row-up", "row-down"), 1400);
      }
      prevRanks.current.set(row.entry, row.rank);
    });
    prevTops.current = nextTops;
  }, [sorted]);

  return (
    <div>
      {sortable ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {SORTS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSort(item.id)}
              className={`min-h-11 shrink-0 border px-3 font-condensed text-[11px] tracking-[0.14em] uppercase ${
                sort === item.id ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
              <th className="py-2 pr-2 font-medium sm:py-3 sm:pr-3">Plass</th>
              <th className="py-2 pr-2 font-medium sm:py-3 sm:pr-3">Manager</th>
              {!compact ? <th className="hidden py-3 pr-3 font-medium sm:table-cell">Lag</th> : null}
              {!compact ? <th className="hidden py-3 pr-3 font-medium md:table-cell">Kaptein</th> : null}
              <th className="py-3 pr-3 text-right font-medium">GW</th>
              <th className="py-3 pr-3 text-right font-medium">Total</th>
              {sortable && !compact ? <th className="hidden py-3 pr-3 text-right font-medium lg:table-cell">Måned</th> : null}
              {remaining ? <th className="hidden py-3 pr-3 text-right font-medium sm:table-cell">Igjen</th> : null}
              <th className="py-3 text-right font-medium">+/-</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.entry}
                data-entry={row.entry}
                className={`border-b border-rule transition-colors hover:bg-black/[0.03] ${
                  highlight === row.entry ? "bg-[#fff6d8]" : ""
                }`}
              >
                <td className="py-2.5 pr-2 font-condensed text-base tabular-nums sm:py-3 sm:pr-3 sm:text-lg">{row.rank}</td>
                <td className="py-2.5 pr-2 sm:py-3 sm:pr-3">
                  <Link href={`/manager/${row.entry}`} className="inline-flex min-h-11 items-center text-[0.95rem] leading-tight hover:underline">
                    {row.manager}
                  </Link>
                  {row.chip ? (
                    <span className="mt-0.5 block font-condensed text-[10px] tracking-[0.12em] text-live uppercase">
                      {row.chip}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-muted sm:hidden">{row.team}</span>
                </td>
                {!compact ? (
                  <td className="hidden py-3 pr-3 text-sm text-muted sm:table-cell">{row.team}</td>
                ) : null}
                {!compact ? (
                  <td className="hidden py-3 pr-3 text-sm md:table-cell">{row.captain || "–"}</td>
                ) : null}
                <td className="py-2.5 pr-2 text-right font-condensed text-base tabular-nums sm:py-3 sm:pr-3 sm:text-lg">{row.gw}</td>
                <td className="py-2.5 pr-2 text-right font-condensed text-base font-semibold tabular-nums sm:py-3 sm:pr-3 sm:text-lg">
                  {row.total}
                </td>
                {sortable && !compact ? (
                  <td className="hidden py-3 pr-3 text-right font-condensed tabular-nums lg:table-cell">
                    {row.month_points}
                  </td>
                ) : null}
                {remaining ? (
                  <td className="hidden py-3 pr-3 text-right font-condensed tabular-nums text-muted sm:table-cell">
                    {row.players_remaining}
                  </td>
                ) : null}
                <td
                  className={`py-2.5 text-right font-condensed text-base tabular-nums sm:py-3 sm:text-lg ${
                    row.rank_change > 0
                      ? "text-[#2f6a32]"
                      : row.rank_change < 0
                        ? "text-live"
                        : "text-muted"
                  }`}
                >
                  {moveLabel(row.rank_change, provisional)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {provisional && !compact ? (
          <p className="mt-3 font-condensed text-[11px] tracking-[0.14em] text-muted uppercase">
            Plasseringene er foreløpige så lenge runden ikke er ferdig.
          </p>
        ) : null}
      </div>
    </div>
  );
}
