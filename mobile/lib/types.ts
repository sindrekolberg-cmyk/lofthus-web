export type Status = {
  event_id: number;
  season?: string;
  is_live: boolean;
  is_finished: boolean;
  provisional: boolean;
  round_kicker?: string;
  event_status_label?: string;
};

export type ManagerRow = {
  entry: number;
  manager: string;
  team: string;
  rank: number;
  gw: number;
  total: number;
  month_points: number;
  month_rank?: number;
  rank_change: number;
  captain?: string;
  players_remaining?: number;
  chip?: string;
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

export type Fixture = {
  id: number;
  home: string;
  away: string;
  home_name?: string;
  away_name?: string;
  home_code?: number;
  away_code?: number;
  home_badge?: string;
  away_badge?: string;
  home_score?: number | null;
  away_score?: number | null;
  status: string;
  status_label?: string;
  kickoff?: string;
  minutes?: number;
  lofthus_headline?: string;
};

export type Story = {
  key: string;
  category?: string;
  headline: string;
  meta?: string;
  manager_entry?: number;
};

export type PopularPlayer = {
  element: number;
  player: string;
  club?: string;
  ownership_pct: number;
  event_points: number;
  image_url?: string;
};

export type AnalysisPlayer = PopularPlayer & {
  ownership_count: number;
  captain_count: number;
  triple_captain_count: number;
  effective_ownership_pct?: number;
  fixture_status?: string;
  fixture_status_label?: string;
};

export type HomePayload = {
  status: Status;
  top5: ManagerRow[];
  movers: { climbers: ManagerRow[]; fallers: ManagerRow[] };
  news: Story[];
  popular: PopularPlayer[];
  month: { name: string; table: ManagerRow[] };
  pulse: { gw: number; label: string; is_live: boolean; fixtures: Fixture[] };
};

export type LeaguePayload = {
  status: Status;
  table: ManagerRow[];
};

export type ManagerProfilePayload = {
  manager?: ManagerRow & { bank?: number; team_value?: number; transfer_cost?: number };
  squad?: { xi?: Array<Record<string, unknown>>; bench?: Array<Record<string, unknown>> };
  form?: Array<{ event: number; points: number; league_rank: number; round_rank: number; is_live?: boolean }>;
  lofthus_membership?: unknown;
};

export type RivalEdge = {
  element: number;
  player: string;
  event_points: number;
  live_swing: number;
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
  provisional: boolean;
  is_live: boolean;
  event_id: number;
};

export type TransferPick = {
  element: number;
  player: string;
  club: string;
  position: string;
  price: number;
  strategy_score: number;
  league_ownership_pct: number;
  league_owners: number;
  league_size: number;
  why: string[];
};

export type TransferStrategyPayload = {
  ok: boolean;
  strategy: { id: string; label: string; risk: number; horizon: number };
  context: { summary: string };
  recommendations: TransferPick[];
  safe: TransferPick[];
  aggressive: TransferPick[];
  differentials: TransferPick[];
  warnings?: string[];
};

export type ChipRow = {
  entry: number;
  manager: string;
  chip: string;
  gw: number;
};

export type HallRow = {
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
  gold?: number;
  silver?: number;
  bronze?: number;
  podiums?: number;
  league_seasons: string[];
  cup_seasons: string[];
};

export type HallOverall = {
  season: string;
  winner?: string;
  runner_up?: string;
  third_place?: string;
};

export type HallCup = {
  season: string;
  winner?: string;
  runner_up?: string;
};

export type HallMonthly = {
  season: string;
  month: string;
  winner?: string;
  runner_up?: string;
  third?: string;
};

export type HallRandom = {
  season: string;
  winner?: string;
  placement?: string;
  note?: string;
};

export type HallRecord = {
  manager: string;
  value: number;
  label: string;
  field: string;
};

export type HallPayload = {
  rows: HallRow[];
  records?: Record<string, HallRecord | null>;
  overall: HallOverall[];
  cup: HallCup[];
  monthly: HallMonthly[];
  random?: HallRandom[];
};

export type MatchImpactPayload = {
  fixture: Fixture;
  owners?: number;
  captains?: number;
  is_live?: boolean;
  provisional?: boolean;
  biggest_winner?: { entry: number; manager: string; swing: number } | null;
  biggest_loser?: { entry: number; manager: string; swing: number } | null;
  players?: Array<{ player: string; event_points: number; club?: string }>;
};