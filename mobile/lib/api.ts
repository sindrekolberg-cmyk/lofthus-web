import type {
  AnalysisPlayer,
  ChipRow,
  HallPayload,
  HomePayload,
  LeaguePayload,
  ManagerOption,
  ManagerProfilePayload,
  MatchImpactPayload,
  RivalPayload,
  TransferStrategyPayload,
} from "./types";

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://lofthus-road-open-api.onrender.com").replace(/\/$/, "");

async function get<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`API svarte ${response.status}`);
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  home: () => get<HomePayload>("/api/home"),
  league: () => get<LeaguePayload>("/api/league"),
  managers: () => get<{ managers: ManagerOption[] }>("/api/managers"),
  manager: (entry: number) => get<ManagerProfilePayload>(`/api/managers/${entry}`),
  hallOfFame: () => get<HallPayload>("/api/hall-of-fame"),
  match: (id: number) => get<MatchImpactPayload>(`/api/live/matches/${id}`),
  rival: (a: number, b: number) => get<RivalPayload>(`/api/rival?manager_a=${a}&manager_b=${b}`),
  analysisCaptain: () => get<{ players: AnalysisPlayer[] }>("/api/analysis/captain"),
  analysisOwnership: () => get<{ players: AnalysisPlayer[]; league_size?: number }>("/api/analysis/ownership"),
  analysisChips: () => get<{ chips: ChipRow[] }>("/api/analysis/chips"),
  analysisDifferentials: () => get<{ players: AnalysisPlayer[] }>("/api/analysis/differentials"),
  analysisTransfers: (params: { entry_id: number; strategy: string; risk: number; horizon: number }) => {
    const query = new URLSearchParams({
      entry_id: String(params.entry_id),
      strategy: params.strategy,
      risk: String(params.risk),
      horizon: String(params.horizon),
      target: "",
      rival_id: "0",
      position: "all",
    });
    return get<TransferStrategyPayload>(`/api/analysis/transfers?${query.toString()}`);
  },
};