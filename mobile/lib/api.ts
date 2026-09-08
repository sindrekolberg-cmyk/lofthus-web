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
import type { LeagueIntelligencePayload } from "./leagueIntelligenceTypes";

export const API_BASE = (process.env.EXPO_PUBLIC_API_BASE_URL || "https://lofthus-road-open-platform-api.onrender.com").replace(/\/$/, "");
export const AUX_BASE = (process.env.EXPO_PUBLIC_PUSH_BASE_URL || "https://lofthus-road-open-push.onrender.com").replace(/\/$/, "");
export const DEFAULT_LEAGUE_ID = 25220;
const FPL_BOOTSTRAP = "https://fantasy.premierleague.com/api/bootstrap-static/";

let activeLeagueId = DEFAULT_LEAGUE_ID;

export function setActiveLeagueId(leagueId: number) {
  const value = Number(leagueId || DEFAULT_LEAGUE_ID);
  activeLeagueId = Number.isFinite(value) && value > 0 ? Math.trunc(value) : DEFAULT_LEAGUE_ID;
}

export function getActiveLeagueId() {
  return activeLeagueId;
}

export function isDefaultLeague() {
  return activeLeagueId === DEFAULT_LEAGUE_ID;
}

type GetOptions = {
  timeoutMs?: number;
  retries?: number;
  baseUrl?: string;
};

export type LeagueConnectPayload = {
  ok: boolean;
  league: { id: number; name: string; size: number; season: string; is_default: boolean };
  managers: ManagerOption[];
  live_ready?: boolean;
  errors?: string[];
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
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        const detail = typeof (payload as { detail?: unknown }).detail === "string" ? (payload as { detail: string }).detail : "";
        throw new Error(detail || `API svarte ${response.status}`);
      }
      return payload as T;
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

function tenantGet<T>(defaultPath: string, tenantPath: string, options: GetOptions = {}) {
  if (isDefaultLeague()) return get<T>(defaultPath, options);
  return get<T>(`/api/tenant/${activeLeagueId}${tenantPath}`, options);
}

function platformTenantGet<T>(tenantPath: string, options: GetOptions = {}) {
  return get<T>(`/api/tenant/${activeLeagueId}${tenantPath}`, options);
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
      const league = Number(row.ownership_pct || 0);
      const meta = byElement.get(Number(row.element)) || {};
      const global = Number(meta.selected_by_percent || 0);
      const form = Number(meta.form || 0);
      const ppg = Number(meta.points_per_game || 0);
      const xgi = Number(meta.expected_goal_involvements_per_90 || 0);
      const status = String(meta.status || "a");
      const rarity = Math.max(0, 100 - league) / 100;
      const formSignal = Math.min(Math.max(form / 10, 0), 1);
      const ppgSignal = Math.min(Math.max(ppg / 8, 0), 1);
      const xgiSignal = Math.min(Math.max(xgi / 0.9, 0), 1);
      const availability = status === "a" ? 1 : 0.55;
      const differentialScore = 100 * availability * (0.48 * rarity + 0.19 * formSignal + 0.17 * ppgSignal + 0.16 * xgiSignal);
      return {
        ...row,
        global_ownership_pct: Math.round(global * 10) / 10,
        ownership_gap_pct: Math.round((league - global) * 10) / 10,
        differential_score: Math.round(differentialScore * 10) / 10,
        form: Math.round(form * 10) / 10,
        points_per_game: Math.round(ppg * 10) / 10,
        season_points: Number(meta.total_points || 0),
        season_minutes: Number(meta.minutes || 0),
        xgi_per90: Math.round(xgi * 1000) / 1000,
        status,
      } satisfies AnalysisPlayer;
    });
    return { ...base, players, sources: ["Mini-ligaens live eierskap", "Fantasy Premier League bootstrap"] };
  } catch {
    return base;
  }
}

const emptyHall: HallPayload = { rows: [], overall: [], cup: [], monthly: [], random: [] };

export const api = {
  setLeague: setActiveLeagueId,
  activeLeagueId: getActiveLeagueId,
  connectLeague: (leagueId: number) => get<LeagueConnectPayload>(`/api/tenant/connect?league_id=${Math.trunc(leagueId)}`, { timeoutMs: 30000, retries: 1 }),
  home: () => tenantGet<HomePayload>("/api/home", "/home", { timeoutMs: 25000, retries: 1 }),
  league: () => tenantGet<LeaguePayload>("/api/league", "/league", { timeoutMs: 25000, retries: 1 }),
  odds: () => isDefaultLeague()
    ? get<OddsPayload>("/api/odds", { timeoutMs: 65000, retries: 1 })
    : Promise.resolve({ ready: false, rows: [], note: "Tabelltipset er foreløpig bare tilgjengelig for Lofthus Road Open." }),
  preseasonTip: () => isDefaultLeague()
    ? get<OddsPayload>("/api/odds", { timeoutMs: 65000, retries: 1 })
    : Promise.resolve({ ready: false, rows: [], note: "Tabelltipset er foreløpig bare tilgjengelig for Lofthus Road Open." }),
  managers: () => tenantGet<{ managers: ManagerOption[] }>("/api/managers", "/managers", { timeoutMs: 25000, retries: 1 }),
  manager: (entry: number) => tenantGet<ManagerProfilePayload>(`/api/managers/${entry}`, `/managers/${entry}`, { timeoutMs: 25000, retries: 1 }),
  hallOfFame: () => isDefaultLeague() ? get<HallPayload>("/api/hall-of-fame") : Promise.resolve(emptyHall),
  match: (id: number) => tenantGet<MatchImpactPayload>(`/api/live/matches/${id}`, `/matches/${id}`, { timeoutMs: 25000, retries: 1 }),
  rival: (a: number, b: number) => tenantGet<RivalPayload>(`/api/rival?manager_a=${a}&manager_b=${b}`, `/rival?manager_a=${a}&manager_b=${b}`, { timeoutMs: 30000, retries: 1 }),
  leagueIntelligence: (entryId: number, goal = "auto") => {
    const query = new URLSearchParams({ entry_id: String(entryId), goal });
    return platformTenantGet<LeagueIntelligencePayload>(`/league-intelligence?${query.toString()}`, { timeoutMs: 65000, retries: 1 });
  },
  analysisCaptain: () => tenantGet<{ players: AnalysisPlayer[] }>("/api/analysis/captain", "/analysis/captain", { timeoutMs: 25000, retries: 1 }),
  analysisOwnership: async () => enrichOwnership(await tenantGet<OwnershipPayload>("/api/analysis/ownership", "/analysis/ownership", { timeoutMs: 30000, retries: 1 })),
  analysisChips: () => isDefaultLeague() ? get<{ chips: ChipRow[] }>("/api/analysis/chips") : Promise.resolve({ chips: [] }),
  analysisDifferentials: () => isDefaultLeague() ? get<{ players: AnalysisPlayer[] }>("/api/analysis/differentials") : Promise.resolve({ players: [] }),
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
    return platformTenantGet<TransferStrategyPayload>(`/deep-analysis/transfers?${query.toString()}`, { timeoutMs: 65000, retries: 1 });
  },
  analysisWildcard: (params: { entry_id: number; strategy: string; risk: number; horizon: number }) => {
    const query = new URLSearchParams({
      entry_id: String(params.entry_id),
      strategy: params.strategy,
      risk: String(params.risk),
      horizon: String(Math.max(5, params.horizon)),
    });
    return platformTenantGet<WildcardPayload>(`/deep-analysis/wildcard?${query.toString()}`, { timeoutMs: 65000, retries: 1 });
  },
};