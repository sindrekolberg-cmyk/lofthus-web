"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ManagerRow, Status } from "@/lib/types";
import { moveLabel } from "@/lib/format";

type SortKey = "rank" | "total" | "gw" | "month" | "up" | "down";

type Props = {
  rows: ManagerRow[];
  status: Status | null;
  compact?: boolean;
  highlight?: number;
  remaining?: boolean;
  sortable?: boolean;
};

const SORTS: { id: SortKey; label: string }[] = [
  { id: "rank", label: "Plass" },
  { id: "total", label: "Totalpoeng" },
  { id: "gw", label: "GW-poeng" },
  { id: "month", label: "Måned" },
  { id: "up", label: "Størst økning" },
  { id: "down", label: "Størst fall" },
];

export function LeagueTable({ rows, status, compact, highlight, remaining, sortable }: Props) {
  const provisional = Boolean(status?.provisional);
  const [sort, setSort] = useState<SortKey>("rank");

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      if (sort === "total") return b.total - a.total || a.rank - b.rank;
      if (sort === "gw") return b.gw - a.gw || a.rank - b.rank;
      if (sort === "month") return b.month_points - a.month_points || a.rank - b.rank;
      if (sort === "up") return b.rank_change - a.rank_change || a.rank - b.rank;
      if (sort === "down") return a.rank_change - b.rank_change || a.rank - b.rank;
      return a.rank - b.rank;
    });
    return copy;
  }, [rows, sort]);

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
        <table className={`w-full border-collapse text-left ${compact ? "" : "min-w-[640px]"}`}>
          <thead>
            <tr className="border-b border-ink font-condensed text-[11px] tracking-[0.16em] text-muted uppercase">
              <th className="py-3 pr-3 font-medium">Plass</th>
              <th className="py-3 pr-3 font-medium">Manager</th>
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
                className={`border-b border-rule transition-colors hover:bg-black/[0.03] ${
                  highlight === row.entry ? "bg-[#fff6d8]" : ""
                }`}
              >
                <td className="py-3 pr-3 font-condensed text-lg tabular-nums">{row.rank}</td>
                <td className="py-3 pr-3">
                  <Link href={`/manager/${row.entry}`} className="text-[0.95rem] leading-tight hover:underline">
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
                <td className="py-3 pr-3 text-right font-condensed text-lg tabular-nums">{row.gw}</td>
                <td className="py-3 pr-3 text-right font-condensed text-lg font-semibold tabular-nums">
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
                  className={`py-3 text-right font-condensed text-lg tabular-nums ${
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
