"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { ManagerRow, Status } from "@/lib/types";
import { moveLabel } from "@/lib/format";
import { randomPrizeLabel, type RandomPrize } from "@/lib/randomPrize";

type SortKey = "rank" | "captain" | "total" | "gw" | "month" | "move";
type SortDirection = "asc" | "desc";

type Props = {
  rows: ManagerRow[];
  status: Status | null;
  compact?: boolean;
  highlight?: number;
  remaining?: boolean;
  sortable?: boolean;
  prize?: RandomPrize | null;
};

const SORTS: { id: SortKey; label: string }[] = [
  { id: "total", label: "Totalpoeng" },
  { id: "month", label: "Måned" },
];

function defaultDirection(key: SortKey): SortDirection {
  return key === "rank" || key === "captain" ? "asc" : "desc";
}

export function LeagueTable({ rows, status, compact, highlight, remaining, sortable, prize }: Props) {
  const provisional = Boolean(status?.provisional);
  const [sort, setSort] = useState<SortKey>("total");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const prevTops = useRef(new Map<number, number>());
  const prevRanks = useRef(new Map<number, number>());

  const changeSort = (key: SortKey) => {
    if (sort === key) {
      setDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }
    setSort(key);
    setDirection(defaultDirection(key));
  };

  const sorted = useMemo(() => {
    const copy = [...rows];
    const factor = direction === "desc" ? -1 : 1;

    copy.sort((a, b) => {
      if (sort === "captain") {
        const captainA = (a.captain || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
        const captainB = (b.captain || "").replace(/\s*\([^)]*\)\s*$/, "").trim();
        const emptyA = captainA ? 0 : 1;
        const emptyB = captainB ? 0 : 1;
        if (emptyA !== emptyB) return emptyA - emptyB;
        const captainDiff = captainA.localeCompare(captainB, "nb", { sensitivity: "base" });
        if (captainDiff !== 0) return captainDiff * factor;
      } else {
        let diff = 0;
        if (sort === "rank") diff = a.rank - b.rank;
        else if (sort === "total") diff = a.total - b.total;
        else if (sort === "gw") diff = a.gw - b.gw;
        else if (sort === "month") diff = a.month_points - b.month_points;
        else if (sort === "move") diff = a.rank_change - b.rank_change;

        if (diff !== 0) return diff * factor;
      }

      return a.rank - b.rank || a.manager.localeCompare(b.manager, "nb");
    });

    return copy;
  }, [rows, sort, direction]);

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

  const arrow = direction === "desc" ? "↓" : "↑";

  const nextSortLabel = (label: string, key: SortKey, active: boolean) => {
    if (key === "captain") {
      return `Sorter kaptein ${active && direction === "asc" ? "Å til A" : "A til Å"}`;
    }
    if (key === "rank") {
      return `Sorter plass ${active && direction === "asc" ? "sisteplass først" : "førsteplass først"}`;
    }
    return `Sorter ${label.toLowerCase()} ${active && direction === "desc" ? "lavest først" : "høyest først"}`;
  };

  const sortableHeader = (label: string, key: SortKey, alignRight = true) => {
    if (!sortable) return label;
    const active = sort === key;
    return (
      <button
        type="button"
        onClick={() => changeSort(key)}
        className={`inline-flex w-full items-center gap-1 hover:text-ink ${alignRight ? "justify-end" : "justify-start"} ${
          active ? "text-ink" : "text-muted"
        }`}
        aria-label={nextSortLabel(label, key, active)}
      >
        {label}
        {active ? <span aria-hidden="true">{arrow}</span> : null}
      </button>
    );
  };

  return (
    <div>
      {sortable ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          {SORTS.map((item) => {
            const active = sort === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeSort(item.id)}
                className={`min-h-11 shrink-0 border px-3 font-condensed text-[11px] tracking-[0.14em] uppercase ${
                  active ? "border-ink bg-ink text-paper" : "border-rule text-muted hover:border-ink hover:text-ink"
                }`}
                aria-label={nextSortLabel(item.label, item.id, active)}
              >
                {item.label}{active ? ` ${arrow}` : ""}
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
              <th className="py-2 pr-2 font-medium sm:py-3 sm:pr-3">{sortableHeader("Plass", "rank", false)}</th>
              <th className="py-2 pr-2 font-medium sm:py-3 sm:pr-3">Manager</th>
              {!compact ? <th className="hidden py-3 pr-3 font-medium sm:table-cell">Lag</th> : null}
              {!compact ? (
                <th className="hidden py-3 pr-3 font-medium md:table-cell">{sortableHeader("Kaptein", "captain", false)}</th>
              ) : null}
              <th className="py-3 pr-3 text-right font-medium">{sortableHeader("GW", "gw")}</th>
              <th className="py-3 pr-3 text-right font-medium">{sortableHeader("Total", "total")}</th>
              {sortable && !compact ? (
                <th className="hidden py-3 pr-3 text-right font-medium lg:table-cell">{sortableHeader("Måned", "month")}</th>
              ) : null}
              {remaining ? <th className="hidden py-3 pr-3 text-right font-medium sm:table-cell">Igjen</th> : null}
              <th className="py-3 text-right font-medium">{sortableHeader("+/-", "move")}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr
                key={row.entry}
                data-entry={row.entry}
                className={`border-b border-rule transition-colors hover:bg-black/[0.03] ${
                  highlight === row.entry ? "bg-[#fff6d8]" : prize && row.rank === prize.rank ? "bg-gold/10" : ""
                }`}
              >
                <td className="py-2.5 pr-2 font-condensed text-base tabular-nums sm:py-3 sm:pr-3 sm:text-lg">{row.rank}</td>
                <td className="py-2.5 pr-2 sm:py-3 sm:pr-3">
                  <Link href={`/manager/${row.entry}`} className="inline-flex min-h-11 items-center text-[0.95rem] leading-tight hover:underline">
                    {row.manager}
                  </Link>
                  {prize && row.rank === prize.rank ? (
                    <span className="mt-0.5 block font-condensed text-[10px] tracking-[0.12em] text-bronze uppercase">
                      🎲 {randomPrizeLabel(prize)}
                    </span>
                  ) : null}
                  {row.chip ? (
                    <span className="mt-0.5 block font-condensed text-[10px] tracking-[0.12em] text-live uppercase">
                      {row.chip}
                    </span>
                  ) : null}
                  <span className="mt-0.5 block text-xs text-muted sm:hidden">{row.team}</span>
                </td>
                {!compact ? <td className="hidden py-3 pr-3 text-sm text-muted sm:table-cell">{row.team}</td> : null}
                {!compact ? <td className="hidden py-3 pr-3 text-sm md:table-cell">{row.captain || "–"}</td> : null}
                <td className="py-2.5 pr-2 text-right font-condensed text-base tabular-nums sm:py-3 sm:pr-3 sm:text-lg">{row.gw}</td>
                <td className="py-2.5 pr-2 text-right font-condensed text-base font-semibold tabular-nums sm:py-3 sm:pr-3 sm:text-lg">{row.total}</td>
                {sortable && !compact ? (
                  <td className="hidden py-3 pr-3 text-right font-condensed tabular-nums lg:table-cell">{row.month_points}</td>
                ) : null}
                {remaining ? (
                  <td className="hidden py-3 pr-3 text-right font-condensed tabular-nums text-muted sm:table-cell">{row.players_remaining}</td>
                ) : null}
                <td
                  className={`py-2.5 text-right font-condensed text-base tabular-nums sm:py-3 sm:text-lg ${
                    row.rank_change > 0 ? "text-[#2f6a32]" : row.rank_change < 0 ? "text-live" : "text-muted"
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
