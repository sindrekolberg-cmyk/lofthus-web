export type EventStatus = "live" | "finished" | "between_matches" | "pre" | string;

export type Status = {
  name: string;
  season: string;
  event_id: number;
  event_status: EventStatus;
  event_status_label: string;
  is_live: boolean;
  is_finished: boolean;
  provisional: boolean;
  month_name: string;
  fetched_at: string | null;
  league_size: number;
  live_ready: boolean;
  histories_ready: boolean;
  data_quality: Record<string, unknown>;
  errors: string[];
  snapshot_id?: string;
  generated_at?: string;
  source_updated_at?: string | null;
  gw?: number;
  phase?: string;
  seq?: number;
  stale?: boolean;
  gw_active?: boolean;
  round_kicker?: string;
};

export type ManagerRow = {
  entry: number;
  manager: string;
  team: string;
  rank: number;
  previous_rank: number;
  rank_change: number;
  captain: string;
  captain_element: number;
  vice_captain: string;
  vice_element: number;
  gw: number;
  gw_gross: number;
  hits: number;
  transfer_cost: number;
  transfer_count: number;
  original_captain?: string;
  original_captain_element?: number;
  effective_captain?: string;
  effective_captain_element?: number;
  captain_fallback?: boolean;
  total: number;
  official_total: number;
  official_gw: number;
  chip: string;
  players_started: number;
  players_finished: number;
  players_live: number;
  players_remaining: number;
  month_points: number;
  month_rank: number;
  team_value: number;
  bank: number;
};

export type PlayerCard = {
  element: number;
  player: string;
  club: string;
  event_points: number;
  ownership_count: number;
  ownership_pct: number;
  captain_count: number;
  triple_captain_count: number;
  effective_ownership_pct: number;
  live_minutes: number;
  fixture_status: string;
  fixture_status_label: string;
  impact_score: number;
  image_url: string;
  league_size?: number;
  owners?: PlayerOwner[];
  kicker?: string;
  headline?: string;
  dek?: string;
  global_ownership_pct?: number;
};

export type PlayerOwner = {
  entry: number;
  manager: string;
  team: string;
  is_captain: boolean;
  is_triple_captain: boolean;
  on_bench: boolean;
};

export type SquadPlayer = {
  element: number;
  player: string;
  full_name: string;
  club: string;
  position: string;
  position_id: number;
  squad_position: number;
  event_points: number;
  gw_contribution: number;
  multiplier: number;
  is_captain: boolean;
  is_vice_captain: boolean;
  is_triple_captain: boolean;
  on_bench: boolean;
  fixture_status: string;
  fixture_status_label: string;
  image_url: string;
  minutes: number;
  autosub_in?: boolean;
  autosub_status?: "confirmed" | "pending" | "";
  replaced_player?: string;
  captain_fallback?: boolean;
};

export type Squad = {
  xi: SquadPlayer[];
  bench: SquadPlayer[];
  lines: {
    gk: SquadPlayer[];
    def: SquadPlayer[];
    mid: SquadPlayer[];
    fwd: SquadPlayer[];
  };
};

export type Story = {
  key: string;
  category: string;
  headline: string;
  meta: string;
  importance: number;
  freshness: number;
  status: string;
  confidence: number;
  manager_entry: number;
  player_element: number;
  image_url?: string;
  source_event?: number;
  source_gw?: number;
  source_fixture?: number;
  created_at?: string;
  updated_at?: string;
  expires_at?: string;
};

export type LiveEvent = {
  id: number;
  fixture_id?: number;
  kickoff: string;
  minutes: number;
  status: string;
  status_label: string;
  home: string;
  away: string;
  home_name: string;
  away_name: string;
  home_score: number | null;
  away_score: number | null;
  lofthus?: PlayerCard[];
  lofthus_owners?: number;
  lofthus_captains?: number;
  lofthus_headline?: string;
  lofthus_winner?: { entry: number; manager: string; swing: number } | null;
  lofthus_loser?: { entry: number; manager: string; swing: number } | null;
};

export type ManagerOption = {
  entry: number;
  manager: string;
  team: string;
  rank: number;
  gw?: number;
  total?: number;
  rank_change?: number;
  players_remaining?: number;
};

export type HomePayload = {
  status: Status;
  hero: { story: Story | null; player: PlayerCard | null };
  top5: ManagerRow[];
  movers: { climbers: ManagerRow[]; fallers: ManagerRow[] };
  news: Story[];
  popular: PlayerCard[];
  month: { name: string; table: ManagerRow[] };
  events: LiveEvent[];
  managers: ManagerOption[];
  pulse: {
    gw: number;
    label: string;
    is_live: boolean;
    fixtures: LiveEvent[];
  };
};

export type LeaguePayload = {
  status: Status;
  table: ManagerRow[];
};

export type MatchImpact = {
  fixture: LiveEvent;
  players: (PlayerCard & {
    owners: {
      entry: number;
      manager: string;
      team?: string;
      multiplier: number;
      is_captain: boolean;
      is_triple_captain: boolean;
      on_bench?: boolean;
    }[];
    differential: boolean;
  })[];
  winners: { entry: number; manager: string; swing: number }[];
  losers: { entry: number; manager: string; swing: number }[];
  biggest_winner: { entry: number; manager: string; swing: number } | null;
  biggest_loser: { entry: number; manager: string; swing: number } | null;
  owners: number;
  captains: number;
  triple_captains?: number;
  provisional: boolean;
  is_live: boolean;
  event_id: number;
};

export type LivePayload = {
  status: Status;
  table: ManagerRow[];
  gw_ranking: ManagerRow[];
  fixtures: LiveEvent[];
  player_impacts: PlayerCard[];
  live_ready: boolean;
};

export type MonthPayload = {
  status: Status;
  month_name: string;
  table: ManagerRow[];
  previous: {
    season: string;
    month: string;
    winner: string;
    runner_up: string;
    third: string;
  }[];
};

export type ManagerProfile = {
  manager: ManagerRow;
  story: string;
  squad: Squad;
  form: {
    event: number;
    points: number;
    total_points: number;
    round_rank: number;
    league_rank: number;
    is_live?: boolean;
    rank_complete?: boolean;
  }[];
  chips: { chip: string; event: number; gw: string }[];
  fpl_career: { season: string; points: number; overall_rank: number | null }[];
  fpl_season: { overall_rank: number | null; total_points: number; value: number | null };
  lofthus_merits: {
    rank: number | null;
    league_gold: number;
    league_silver: number;
    league_bronze: number;
    cup_gold: number;
    cup_silver: number;
    monthly_gold: number;
    monthly_silver: number;
    monthly_bronze: number;
    league_seasons: string[];
    cup_seasons: string[];
  };
  lofthus_overall: { season: string; place: number }[];
  lofthus_best_finish: number | null;
  lofthus_membership: {
    season: string;
    league_id: string;
    entry_id: string;
    manager: string;
    team: string;
    final_rank: string;
    points: string;
    member: boolean;
  }[];
  provisional: boolean;
  event_id: number;
  month_name: string;
  is_live: boolean;
};

export type RivalEdge = {
  element: number;
  player: string;
  my_multiplier: number;
  rival_multiplier: number;
  multiplier_edge: number;
  event_points: number;
  live_swing: number;
  status: string;
  status_label: string;
  event_kind?: string;
  headline: string;
};

export type RivalPayload = {
  me: ManagerRow;
  rival: ManagerRow;
  live_gap: number;
  pre_gw_gap: number;
  total_gap: number;
  gw_gap: number;
  common_players: number;
  captains: { me: string; rival: string };
  players_remaining: { me: number; rival: number };
  cheer_for: RivalEdge[];
  hope_blank: RivalEdge[];
  my_unique: RivalEdge[];
  rival_unique: RivalEdge[];
  suggested_rivals: number[];
  provisional: boolean;
  is_live: boolean;
  event_id: number;
  strategy?: { context: string; text: string; gap: number; threshold: number };
};

export type ComparePayload = {
  a: ManagerRow;
  b: ManagerRow;
  total_gap: number;
  gw_gap: number;
  rank_gap: number;
  captains: { a: string; b: string };
  chips: { a: string; b: string };
  overlap: number;
  unique: { a: number; b: number };
  form_a: ManagerProfile["form"];
  form_b: ManagerProfile["form"];
  provisional: boolean;
};

export type TransferPick = {
  element: number;
  player: string;
  club: string;
  position: string;
  price: number;
  image_url?: string;
  fixtures: string[];
  league_ownership_pct: number;
  league_owners: number;
  league_size: number;
  target_cohort_ownership_pct: number;
  target_cohort_owners: number;
  target_cohort_size: number;
  target_cohort_non_owner_count: number;
  global_ownership_pct?: number;
  strategy_score: number;
  projection_index: number;
  relative_upside: string;
  nedsiderisiko: string;
  risk: string;
  strategic_value: string;
  datagrunnlag: string;
  why: string[];
  news?: string;
  budget?: { status: string; label: string };
};

export type TransferStrategyPayload = {
  ok: boolean;
  projection_source: string;
  strategy: { id: string; label: string; blurb: string; risk: number; horizon: number; target: string; position: string };
  manager: { entry: number; manager: string; team: string; rank: number; total: number; bank: number | null; chip: string };
  context: {
    league_rank: number;
    league_size: number;
    points_gap: number;
    gap_to_top10: number;
    rounds_remaining: number;
    target_cohort: { label: string; size: number };
    month_name: string;
    rival_id: number | null;
    chasing_rival: boolean;
    summary: string;
  };
  recommendations: TransferPick[];
  safe: TransferPick[];
  aggressive: TransferPick[];
  differentials: TransferPick[];
  sell_candidates: {
    element: number;
    player: string;
    club: string;
    position: string;
    why: string[];
    sell_score: number;
  }[];
  pairs: {
    out: { element: number; player: string; club: string };
    inn: { element: number; player: string; club: string };
    budget: { status: string; label: string };
    why: string[];
  }[];
  why_not: { element: number; player: string; line: string }[];
  compare_modes: { element: number; player: string; scores: Record<string, number> }[];
  warnings: string[];
};

export type HistoryPayload = {
  overall: {
    season: string;
    winner: string;
    runner_up: string;
    third_place: string;
    note: string;
    status: string;
  }[];
  cup: {
    season: string;
    winner: string;
    runner_up: string;
    note: string;
    status: string;
  }[];
  random: {
    season: string;
    winner: string;
    placement: string;
    note: string;
  }[];
  monthly: {
    season: string;
    month: string;
    winner: string;
    runner_up: string;
    third: string;
  }[];
};

export type HallOfFameRow = {
  rank: number;
  manager: string;
  league_gold: number;
  league_silver: number;
  league_bronze: number;
  cup_gold: number;
  cup_silver: number;
  monthly_gold: number;
  monthly_silver: number;
  monthly_bronze: number;
  gold: number;
  silver: number;
  bronze: number;
  podiums: number;
  league_seasons: string[];
  cup_seasons: string[];
};

export const nav = [
  { href: "/", label: "Forside" },
  { href: "/liga", label: "Liga" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/analyse", label: "Analyseverktøy" },
];

export const bottomNav = [
  { href: "/", label: "Forside" },
  { href: "/liga", label: "Liga" },
  { href: "/analyse", label: "Analyse" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
];

export type OddsPayload = {
  rows: {
    entry: number;
    manager: string;
    rank: number;
    win_pct: number;
    odds: number;
    preseason_odds: number;
    note: string;
  }[];
  ready: boolean;
  note?: string;
};

export const analysisEntries = [
  {
    href: "/analyse/transferstrategi",
    kicker: "Neste trekk",
    title: "Transferstrategi",
    line: "Enkeltbytte eller wildcard: tilpassede råd etter målet ditt, risikoen du tåler og hvem du prøver å slå.",
  },
  {
    href: "/analyse/rivalradar",
    kicker: "Hvem jakter deg",
    title: "Rivalradar",
    line: "Live-avstand, kapteiner, heia på og håp på blank.",
  },
  {
    href: "/analyse/kaptein",
    kicker: "Armbindet",
    title: "Kaptein",
    line: "Hvem bar C-en, og hvem fikk betalt for det.",
  },
  {
    href: "/analyse/ownership",
    kicker: "Feltet",
    title: "Eierskap",
    line: "Hvem alle har, og hvem som splittet ligaen.",
  },
  {
    href: "/analyse/chips",
    kicker: "Timing",
    title: "Sjetonger",
    line: "Wildcard, benkboost og de som fortsatt venter.",
  },
  {
    href: "/analyse/differensialer",
    kicker: "Skjevt",
    title: "Differensialer",
    line: "Lavt eierskap og faktisk avkastning.",
  },
  {
    href: "/analyse/compare",
    kicker: "Side om side",
    title: "Sammenlign",
    line: "To managere. Bred sammenligning, ikke live-duell.",
  },
  {
    href: "/analyse/odds",
    kicker: "Marked",
    title: "Odds",
    line: "Før-sesongen oppdatert med tabellen — ikke veddemålstips.",
  },
];
