export type Status = {
  event_id: number;
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

export type Fixture = {
  id: number;
  home: string;
  away: string;
  home_score?: number | null;
  away_score?: number | null;
  status: string;
  status_label?: string;
  kickoff?: string;
  lofthus_headline?: string;
};

export type Story = {
  key: string;
  category?: string;
  headline: string;
  meta?: string;
};

export type PopularPlayer = {
  element: number;
  player: string;
  ownership_pct: number;
  event_points: number;
  image_url?: string;
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

export type HallRow = {
  rank: number;
  manager: string;
  league_gold: number;
  cup_gold: number;
  monthly_gold: number;
  monthly_silver: number;
  monthly_bronze: number;
};

export type HallPayload = {
  rows: HallRow[];
  overall: Array<{ season: string; winner?: string; runner_up?: string; third_place?: string }>;
  cup: Array<{ season: string; winner?: string; runner_up?: string }>;
  monthly: Array<{ season: string; month: string; winner?: string; runner_up?: string; third?: string }>;
};
