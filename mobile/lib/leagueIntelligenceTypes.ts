export type LeagueIntelManager = {
  entry: number;
  manager: string;
  team: string;
  rank: number;
  total: number;
  gw: number;
  month_rank?: number;
  month_points?: number;
  rank_change: number;
  players_remaining?: number;
  gap_to_leader?: number;
};

export type LeagueIntelPlayer = {
  element: number;
  player: string;
  club: string;
  position: string;
  price: number;
  event_points: number;
  projection_index: number;
  lofthus_ownership_pct: number;
  target_ownership_pct: number;
  global_ownership_pct: number;
  form: number;
  xgi_per90: number;
  my_multiplier: number;
  target_multiplier: number;
  live_swing: number;
  evidence?: string[];
};

export type LeagueIntelligencePayload = {
  ok: boolean;
  phase: "plan" | "live" | "verdict";
  manager: LeagueIntelManager;
  goal: { id: string; label: string };
  forecast: {
    win_pct: number;
    top3_pct: number;
    top10_pct: number;
    beat_next_pct: number;
    month_win_pct: number;
    expected_rank: number;
    rounds_remaining: number;
    simulations: number;
    model: string;
    model_note: string;
  };
  mission: {
    goal: string;
    goal_label: string;
    headline: string;
    detail: string;
    target_rank: number;
    target_entries: number[];
    gap_points: number;
    probability_pct: number;
    recommended_risk: string;
    cohort: Array<{ entry: number; manager: string; rank: number; total: number }>;
  };
  battle: {
    target_entries: number[];
    weapons: LeagueIntelPlayer[];
    threats: LeagueIntelPlayer[];
    opportunities: LeagueIntelPlayer[];
    live_swings: LeagueIntelPlayer[];
  };
  verdict: {
    headline: string;
    rank: number;
    rank_change: number;
    gw_points: number;
    target_average_gw: number;
    relative_to_target: number;
  };
  next_rival?: {
    entry: number;
    manager: string;
    rank: number;
    total: number;
    gap: number;
  } | null;
  event: {
    id: number;
    is_live: boolean;
    is_finished: boolean;
    status: string;
  };
  product_loop?: {
    plan: string;
    reveal: string;
    live: string;
    verdict: string;
  };
  data_sources?: string[];
};
