import { monthPodiums } from "./hof-points";
import { nameMatches, newestSeasonFirst } from "./format";
import type { HallCup, HallMonthly, HallOverall, HallPayload, HallRandom, HallRow } from "./types";

export type HallTab = "overview" | "seasons" | "month" | "cup" | "random" | "managers";

export const HALL_TABS: { id: HallTab; label: string }[] = [
  { id: "overview", label: "Oversikt" },
  { id: "seasons", label: "Sesong for sesong" },
  { id: "month", label: "Månedsvinnere" },
  { id: "cup", label: "Cupvinnere" },
  { id: "random", label: "Random plassering" },
  { id: "managers", label: "Detaljert manageroversikt" },
];

export type MeritRecord = {
  label: string;
  value: number;
  managers: string[];
};

export function emptyHonours(): HallRow {
  return {
    rank: 0,
    manager: "",
    league_gold: 0,
    league_silver: 0,
    league_bronze: 0,
    cup_gold: 0,
    cup_silver: 0,
    monthly_gold: 0,
    monthly_silver: 0,
    monthly_bronze: 0,
    league_seasons: [],
    cup_seasons: [],
  };
}

export function deriveRecords(rows: HallRow[]): MeritRecord[] {
  const specs: { label: string; value: (row: HallRow) => number }[] = [
    { label: "Flest sammenlagtseiere", value: (row) => row.league_gold },
    { label: "Flest cupgull", value: (row) => row.cup_gold },
    { label: "Flest månedsseiere", value: (row) => row.monthly_gold },
    { label: "Flest månedspodier", value: (row) => monthPodiums(row) },
  ];
  return specs.map((spec) => {
    const best = Math.max(0, ...rows.map(spec.value));
    const managers = best > 0 ? rows.filter((row) => spec.value(row) === best).map((row) => row.manager) : [];
    return { label: spec.label, value: best, managers };
  });
}

export function overallPlace(row: HallOverall, manager: string) {
  if (nameMatches(row.winner, manager)) return 1;
  if (nameMatches(row.runner_up, manager)) return 2;
  if (nameMatches(row.third_place, manager)) return 3;
  return null;
}

export function monthlyPlaceLabel(row: HallMonthly, manager: string) {
  if (nameMatches(row.winner, manager)) return "Månedsseier";
  if (nameMatches(row.runner_up, manager)) return "Månedssølv";
  if (nameMatches(row.third, manager)) return "Månedsbronse";
  return null;
}

export function cupRole(row: HallCup, manager: string) {
  if (nameMatches(row.winner, manager)) return "Cupvinner";
  if (nameMatches(row.runner_up, manager)) return "Finale";
  return null;
}

export function managerSeasons(data: HallPayload, manager: string) {
  return data.overall
    .map((row) => {
      const place = overallPlace(row, manager);
      return place ? { season: row.season, place } : null;
    })
    .filter((row): row is { season: string; place: number } => row !== null)
    .sort((a, b) => newestSeasonFirst(a.season, b.season));
}

export function managerMonths(data: HallPayload, manager: string) {
  return data.monthly
    .map((row) => {
      const label = monthlyPlaceLabel(row, manager);
      return label ? { season: row.season, month: row.month, label } : null;
    })
    .filter((row): row is { season: string; month: string; label: string } => row !== null)
    .sort((a, b) => newestSeasonFirst(a.season, b.season) || a.month.localeCompare(b.month, "nb"));
}

export function managerCups(data: HallPayload, manager: string) {
  return data.cup
    .map((row) => {
      const role = cupRole(row, manager);
      return role ? { season: row.season, role } : null;
    })
    .filter((row): row is { season: string; role: string } => row !== null)
    .sort((a, b) => newestSeasonFirst(a.season, b.season));
}

export function firstSeasonLine(data: HallPayload, manager: string, row: HallRow) {
  const seasons = [
    ...row.league_seasons,
    ...row.cup_seasons,
    ...managerSeasons(data, manager).map((item) => item.season),
    ...managerMonths(data, manager).map((item) => item.season),
    ...managerCups(data, manager).map((item) => item.season),
  ].filter(Boolean);
  if (!seasons.length) return "Første sesong i ligaen er ikke registrert";
  const first = [...seasons].sort((a, b) => a.localeCompare(b, "nb"))[0];
  return `Første sesong: ${first}`;
}

export function documentedPlacements(random: HallRandom[] | undefined) {
  return (random || []).filter((row) => row.winner && row.placement);
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
