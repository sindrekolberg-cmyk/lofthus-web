import { monthPodiums, nameMatches, newestSeasonFirst } from "./format";
import type { HallOfFameRow, HistoryPayload } from "./types";

export type HallTab = "overview" | "seasons" | "month" | "cup";

export const HALL_TABS: { id: HallTab; label: string }[] = [
  { id: "overview", label: "Oversikt" },
  { id: "seasons", label: "Sesong for sesong" },
  { id: "month", label: "Månedsvinnere" },
  { id: "cup", label: "Cupvinnere" },
];

/** Mirrors `HALL_OF_FAME_HIERARCHY` in the backend's `lro_history.py`. */
const HALL_HIERARCHY = [
  "league_gold",
  "cup_gold",
  "league_silver",
  "league_bronze",
  "monthly_gold",
  "cup_silver",
  "monthly_silver",
  "monthly_bronze",
] as const;

/** Mirrors `normalize_text` in the backend, so both sides break ties identically. */
function sortName(name: string) {
  return name
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function compareLegends(a: HallOfFameRow, b: HallOfFameRow) {
  for (const key of HALL_HIERARCHY) {
    const diff = (b[key] || 0) - (a[key] || 0);
    if (diff) return diff;
  }
  const left = sortName(a.manager);
  const right = sortName(b.manager);
  return left < right ? -1 : left > right ? 1 : 0;
}

export function legendRanking(rows: HallOfFameRow[], limit = 5) {
  return (rows || [])
    .filter((row) => HALL_HIERARCHY.some((key) => (row[key] || 0) > 0))
    .sort(compareLegends)
    .slice(0, limit);
}

export type LegendMerit = { key: string; value: number; label: string };

function merit(key: string, value: number, singular: string, plural: string): LegendMerit {
  return { key, value, label: value === 1 ? singular : plural };
}

export function legendMerits(row: HallOfFameRow): LegendMerit[] {
  return [
    merit("league", row.league_gold, "ligatittel", "ligatitler"),
    merit("cup", row.cup_gold, "cupgull", "cupgull"),
    merit("month", row.monthly_gold, "månedsseier", "månedsseiere"),
    merit("podium", monthPodiums(row), "månedspodium", "månedspodier"),
  ].filter((item) => item.value > 0);
}

export function overallPlace(row: HistoryPayload["overall"][number], manager: string) {
  if (nameMatches(row.winner, manager)) return 1;
  if (nameMatches(row.runner_up, manager)) return 2;
  if (nameMatches(row.third_place, manager)) return 3;
  return null;
}

export function monthlyPlaceLabel(row: HistoryPayload["monthly"][number], manager: string) {
  if (nameMatches(row.winner, manager)) return "Månedsseier";
  if (nameMatches(row.runner_up, manager)) return "Månedssølv";
  if (nameMatches(row.third, manager)) return "Månedsbronse";
  return null;
}

export function cupRole(row: HistoryPayload["cup"][number], manager: string) {
  if (nameMatches(row.winner, manager)) return "Cupvinner";
  if (nameMatches(row.runner_up, manager)) return "Finale";
  return null;
}

export function groupBySeason<T extends { season: string }>(rows: T[]) {
  const order: string[] = [];
  const grouped = new Map<string, T[]>();
  [...rows].sort((a, b) => newestSeasonFirst(a.season, b.season)).forEach((row) => {
    if (!grouped.has(row.season)) {
      grouped.set(row.season, []);
      order.push(row.season);
    }
    grouped.get(row.season)?.push(row);
  });
  return order.map((season) => ({ season, rows: grouped.get(season) || [] }));
}
