export type RandomPrize = {
  season: string;
  rank: number;
  amount: number;
};

/** Årets randompremie. Legg inn én rad per sesong når plasseringen er trukket. */
export const RANDOM_PRIZES: RandomPrize[] = [
  { season: "2026/27", rank: 35, amount: 500 },
];

export function randomPrizeFor(season?: string): RandomPrize | null {
  if (!season) return null;
  return RANDOM_PRIZES.find((prize) => prize.season === season) || null;
}

export function randomPrizeLabel(prize: RandomPrize) {
  return `${prize.amount} kr-plassen`;
}
