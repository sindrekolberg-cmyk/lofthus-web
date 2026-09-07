export const HOF_POINTS = {
  overall_gold: 100,
  overall_silver: 60,
  overall_bronze: 40,
  cup_gold: 50,
  cup_silver: 25,
  month_gold: 15,
  month_silver: 8,
  month_bronze: 5,
} as const;

export type HofHonours = {
  league_gold: number;
  league_silver: number;
  league_bronze: number;
  cup_gold: number;
  cup_silver: number;
  monthly_gold: number;
  monthly_silver: number;
  monthly_bronze: number;
};

export function historicalPoints(row: HofHonours) {
  return (
    row.league_gold * HOF_POINTS.overall_gold +
    row.league_silver * HOF_POINTS.overall_silver +
    row.league_bronze * HOF_POINTS.overall_bronze +
    row.cup_gold * HOF_POINTS.cup_gold +
    row.cup_silver * HOF_POINTS.cup_silver +
    row.monthly_gold * HOF_POINTS.month_gold +
    row.monthly_silver * HOF_POINTS.month_silver +
    row.monthly_bronze * HOF_POINTS.month_bronze
  );
}

export function monthPodiums(row: Pick<HofHonours, "monthly_gold" | "monthly_silver" | "monthly_bronze">) {
  return row.monthly_gold + row.monthly_silver + row.monthly_bronze;
}
