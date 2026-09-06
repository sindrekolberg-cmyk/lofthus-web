import type {
  ComparePayload,
  HallOfFameRow,
  HistoryPayload,
  HomePayload,
  LeaguePayload,
  LivePayload,
  ManagerOption,
  ManagerProfile,
  MatchImpact,
  MonthPayload,
  PlayerCard,
  RivalPayload,
  Status,
  TransferStrategyPayload,
} from "./types";

function configuredBase() {
  return (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");
}

export function getApiBase() {
  const explicit = configuredBase();
  if (explicit) {
    if (
      process.env.NODE_ENV === "production" &&
      /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i.test(explicit)
    ) {
      return "";
    }
    return explicit;
  }
  if (process.env.NODE_ENV !== "production") return "http://localhost:8000";
  return "";
}

export const API_BASE = getApiBase();

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function apiConfigured() {
  return Boolean(getApiBase());
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const base = getApiBase();
  if (!base) {
    throw new ApiError(
      "Kunne ikke hente live-data akkurat nå. Prøv igjen om litt.",
      0,
    );
  }
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { Accept: "application/json", ...(init?.headers || {}) },
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Kunne ikke hente live-data akkurat nå.", 0);
  }
  if (!res.ok) {
    let detail = `API-feil (${res.status})`;
    try {
      const body = (await res.json()) as { detail?: string };
      if (body.detail) detail = body.detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(detail, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  health: () => apiGet<{ ok: boolean }>("/api/health"),
  status: () => apiGet<Status>("/api/status"),
  home: () => apiGet<HomePayload>("/api/home"),
  league: () => apiGet<LeaguePayload>("/api/league"),
  live: () => apiGet<LivePayload>("/api/live"),
  match: (id: number) => apiGet<MatchImpact>(`/api/live/matches/${id}`),
  month: () => apiGet<MonthPayload>("/api/month"),
  managers: () => apiGet<{ managers: ManagerOption[] }>("/api/managers"),
  manager: (entry: number) => apiGet<ManagerProfile>(`/api/managers/${entry}`),
  rival: (a: number, b: number) =>
    apiGet<RivalPayload>(`/api/rival?manager_a=${a}&manager_b=${b}`),
  compare: (a: number, b: number) =>
    apiGet<ComparePayload>(`/api/compare?manager_a=${a}&manager_b=${b}`),
  history: () => apiGet<HistoryPayload>("/api/history"),
  hallOfFame: () =>
    apiGet<{
      rows: HallOfFameRow[];
      records?: Record<
        string,
        { manager: string; value: number; label: string; field: string } | null
      >;
      overall?: HistoryPayload["overall"];
      cup?: HistoryPayload["cup"];
      monthly?: HistoryPayload["monthly"];
      random?: HistoryPayload["random"];
    }>("/api/hall-of-fame"),
  news: () => apiGet<{ stories: HomePayload["news"] }>("/api/news"),
  popular: () => apiGet<{ players: PlayerCard[] }>("/api/players/popular"),
  analysisCaptain: () => apiGet<{ players: PlayerCard[] }>("/api/analysis/captain"),
  analysisOwnership: () =>
    apiGet<{ players: PlayerCard[]; league_size?: number; loaded_managers?: number; complete?: boolean }>("/api/analysis/ownership"),
  analysisChips: () =>
    apiGet<{ chips: { entry: number; manager: string; chip: string; gw: number }[] }>(
      "/api/analysis/chips",
    ),
  analysisDifferentials: () =>
    apiGet<{ players: PlayerCard[] }>("/api/analysis/differentials"),
  analysisTransfers: (params: {
    entry_id: number;
    strategy: string;
    risk: number;
    horizon: number;
    target?: string;
    rival_id?: number;
    position?: string;
  }) => {
    const q = new URLSearchParams({
      entry_id: String(params.entry_id),
      strategy: params.strategy,
      risk: String(params.risk),
      horizon: String(params.horizon),
      target: params.target || "",
      rival_id: String(params.rival_id || 0),
      position: params.position || "all",
    });
    return apiGet<TransferStrategyPayload>(`/api/analysis/transfers?${q}`);
  },
  odds: () =>
    apiGet<{
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
    }>("/api/odds"),
  archive: () => apiGet<{ snapshots: unknown[] }>("/api/archive"),
};
