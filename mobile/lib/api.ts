import type { HallPayload, HomePayload, LeaguePayload, ManagerProfilePayload } from "./types";

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
  manager: (entry: number) => get<ManagerProfilePayload>(`/api/managers/${entry}`),
  hallOfFame: () => get<HallPayload>("/api/hall-of-fame"),
};
