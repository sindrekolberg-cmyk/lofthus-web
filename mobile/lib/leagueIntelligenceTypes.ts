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
  position_id: number;
  event_points: number;
  projection_index: number;
  league_ownership_pct: number;
  target_ownership_pct: number;
  target_effective_ownership_pct: number;
  global_ownership_pct: number;
  form: number;
  xgi_per90: number;
  my_multiplier: number;
  live_swing: number;
  evidence?: string[];
  confidence?: string;
};

export type LeagueIntelligencePayload = {
  ok: boolean;
  phase: "plan" | "live" | "verdict";
  league?: { id: number; name: string; size: number };
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
    manager_expected_gw?: number;
    manager_volatility?: number;
    manager_uniqueness_pct?: number;
    squad_strength_index?: number;
  };
  mission: {
    goal: string;
    goal_label: string;
    headline: string;
    detail: string;
    target_rank: number;
    target_entries: number[];
    target_manager?: string;
    gap_points: number;
    required_gain_per_round?: number;
    probability_pct: number;
    recommended_risk: string;
    recommended_strategy?: string;
    defending?: boolean;
  };
  battle: {
    target_entries: number[];
    target_managers?: string[];
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
  current_best_xi?: number[];
  coverage?: {
    league_size?: number;
    loaded_managers?: number;
    history_managers?: number;
    projected_players?: number;
    fixture_horizon_events?: number[];
    first_future_event?: string | number;
    ownership_complete?: boolean;
  };
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
