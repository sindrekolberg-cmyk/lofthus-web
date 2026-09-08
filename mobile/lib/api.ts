import type {
  AnalysisPlayer,
  ChipRow,
  HallPayload,
  HomePayload,
  LeaguePayload,
  ManagerOption,
  ManagerProfilePayload,
  MatchImpactPayload,
  OddsPayload,
  RivalPayload,
  TransferStrategyPayload,
} from "./types";

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://lofthus-road-open-api.onrender.com").replace(/\/$/, "");

type GetOptions = {
  timeoutMs?: number;
  retries?: number;
};

function isRetryableFetchError(error: unknown) {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /abort|cancel|fetch failed|network request failed|timed out|timeout/i.test(text);
}

async function get<T>(path: string, options: GetOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const retries = options.retries ?? 0;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`API svarte ${response.status}`);
      return (await response.json()) as T;
    } catch (error) {
      lastError = error;
      if (attempt < retries && isRetryableFetchError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
        continue;
      }
      if (isRetryableFetchError(error)) {
        throw new Error("Serveren brukte for lang tid på å svare. Dra ned for å prøve igjen.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Kunne ikke hente data.");
}

export const api = {
  home: () => get<HomePayload>("/api/home"),
  league: () => get<LeaguePayload>("/api/league"),
  odds: () => get<OddsPayload>("/api/odds", { timeoutMs: 65000, retries: 1 }),
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