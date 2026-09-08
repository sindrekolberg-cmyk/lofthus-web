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
  OwnershipPayload,
  RivalPayload,
  TransferStrategyPayload,
} from "./types";
import type { WildcardPayload } from "./wildcardTypes";

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://lofthus-road-open-api.onrender.com").replace(/\/$/, "");
export const AUX_BASE = (process.env.EXPO_PUBLIC_PUSH_BASE_URL || "https://lofthus-road-open-push.onrender.com").replace(/\/$/, "");
const FPL_BOOTSTRAP = "https://fantasy.premierleague.com/api/bootstrap-static/";

type GetOptions = {
  timeoutMs?: number;
  retries?: number;
  baseUrl?: string;
};

function isRetryableFetchError(error: unknown) {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /abort|cancel|fetch failed|network request failed|timed out|timeout/i.test(text);
}

async function get<T>(path: string, options: GetOptions = {}): Promise<T> {
  const timeoutMs = options.timeoutMs ?? 15000;
  const retries = options.retries ?? 0;
  const baseUrl = options.baseUrl ?? API_BASE;
  let lastError: unknown = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${baseUrl}${path}`, {
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

async function enrichOwnership(base: OwnershipPayload): Promise<OwnershipPayload> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    const response = await fetch(FPL_BOOTSTRAP, { headers: { Accept: "application/json" }, signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) return base;
    const bootstrap = await response.json() as { elements?: Array<Record<string, unknown>> };
    const byElement = new Map<number, Record<string, unknown>>();
    for (const raw of bootstrap.elements || []) {
      const element = Number(raw.id || 0);
      if (element) byElement.set(element, raw);
    }

    const players = (base.players || []).map((source) => {
      const row = { ...source };
      const meta = byElement.get(Number(row.element)) || {};
      const lofthus = Number(row.ownership_pct || 0);
      const global = Number(meta.selected_by_percent || 0);
      const form = Number(meta.form || 0);
      const ppg = Number(meta.points_per_game || 0);
      const xgi = Number(meta.expected_goal_involvements_per_90 || 0);
      const status = String(meta.status || "a");
      const rarity = Math.max(0, 100 - lofthus) / 100;
      const formSignal = Math.min(Math.max(form / 10, 0), 1);
      const ppgSignal = Math.min(Math.max(ppg / 8, 0), 1);
      const xgiSignal = Math.min(Math.max(xgi / 0.9, 0), 1);
      const availability = status === "a" ? 1 : 0.55;
      const differentialScore = 100 * availability * (0.48 * rarity + 0.19 * formSignal + 0.17 * ppgSignal + 0.16 * xgiSignal);
      return {
        ...row,
        global_ownership_pct: Math.round(global * 10) / 10,
        ownership_gap_pct: Math.round((lofthus - global) * 10) / 10,
        differential_score: Math.round(differentialScore * 10) / 10,
        form: Math.round(form * 10) / 10,
        points_per_game: Math.round(ppg * 10) / 10,
        season_points: Number(meta.total_points || 0),
        season_minutes: Number(meta.minutes || 0),
        xgi_per90: Math.round(xgi * 1000) / 1000,
        status,
      } satisfies AnalysisPlayer;
    });
    return { ...base, players, sources: ["Lofthus Road Open live ownership", "Fantasy Premier League bootstrap"] };
  } catch {
    return base;
  }
}

export const api = {
  home: () => get<HomePayload>("/api/home"),
  league: () => get<LeaguePayload>("/api/league"),
  odds: () => get<OddsPayload>("/api/odds", { timeoutMs: 65000, retries: 1 }),
  preseasonTip: () => get<OddsPayload>("/api/preseason-tip", { timeoutMs: 65000, retries: 1, baseUrl: AUX_BASE }),
  managers: () => get<{ managers: ManagerOption[] }>("/api/managers"),
  manager: (entry: number) => get<ManagerProfilePayload>(`/api/managers/${entry}`),
  hallOfFame: () => get<HallPayload>("/api/hall-of-fame"),
  match: (id: number) => get<MatchImpactPayload>(`/api/live/matches/${id}`),
  rival: (a: number, b: number) => get<RivalPayload>(`/api/rival?manager_a=${a}&manager_b=${b}`),
  analysisCaptain: () => get<{ players: AnalysisPlayer[] }>("/api/analysis/captain"),
  analysisOwnership: async () => enrichOwnership(await get<OwnershipPayload>("/api/analysis/ownership", { timeoutMs: 25000, retries: 1 })),
  analysisChips: () => get<{ chips: ChipRow[] }>("/api/analysis/chips"),
  analysisDifferentials: () => get<{ players: AnalysisPlayer[] }>("/api/analysis/differentials"),
  analysisTransfers: (params: { entry_id: number; strategy: string; risk: number; horizon: number }) => {
    const query = new URLSearchParams({
      entry_id: String(params.entry_id),
      strategy: params.strategy,
      risk: String(params.risk),
      horizon: String(Math.max(5, params.horizon)),
      target: "",
      rival_id: "0",
      position: "all",
    });
    return get<TransferStrategyPayload>(`/api/deep-analysis/transfers?${query.toString()}`, {
      timeoutMs: 65000,
      retries: 1,
      baseUrl: AUX_BASE,
    });
  },
  analysisWildcard: (params: { entry_id: number; strategy: string; risk: number; horizon: number }) => {
    const query = new URLSearchParams({
      entry_id: String(params.entry_id),
      strategy: params.strategy,
      risk: String(params.risk),
      horizon: String(Math.max(5, params.horizon)),
    });
    return get<WildcardPayload>(`/api/deep-analysis/wildcard?${query.toString()}`, {
      timeoutMs: 65000,
      retries: 1,
      baseUrl: AUX_BASE,
    });
  },
};