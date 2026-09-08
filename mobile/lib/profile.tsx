import { createContext, type ReactNode, useContext, useMemo, useState } from "react";
import { Platform, Settings } from "react-native";
import { DEFAULT_LEAGUE_ID, setActiveLeagueId } from "./api";

const STORAGE_KEY = "lofthus_profile_v1";

export type AppProfile = {
  leagueId: number;
  leagueName: string;
  leagueSize?: number;
  season?: string;
  entryId: number;
  managerName: string;
  team: string;
};

const DEFAULT_PROFILE: AppProfile = {
  leagueId: DEFAULT_LEAGUE_ID,
  leagueName: "Lofthus Road Open",
  entryId: 0,
  managerName: "",
  team: "",
};

function normalize(raw: Partial<AppProfile> | null | undefined): AppProfile {
  const leagueId = Number(raw?.leagueId || DEFAULT_LEAGUE_ID);
  const entryId = Number(raw?.entryId || 0);
  return {
    leagueId: Number.isFinite(leagueId) && leagueId > 0 ? Math.trunc(leagueId) : DEFAULT_LEAGUE_ID,
    leagueName: String(raw?.leagueName || (leagueId === DEFAULT_LEAGUE_ID ? "Lofthus Road Open" : `FPL-liga ${leagueId}`)),
    leagueSize: raw?.leagueSize ? Number(raw.leagueSize) : undefined,
    season: raw?.season ? String(raw.season) : undefined,
    entryId: Number.isFinite(entryId) && entryId > 0 ? Math.trunc(entryId) : 0,
    managerName: String(raw?.managerName || ""),
    team: String(raw?.team || ""),
  };
}

export function readStoredProfile(): AppProfile {
  if (Platform.OS !== "ios") {
    setActiveLeagueId(DEFAULT_PROFILE.leagueId);
    return DEFAULT_PROFILE;
  }
  try {
    const raw = Settings.get(STORAGE_KEY);
    const parsed = typeof raw === "string" ? JSON.parse(raw) as Partial<AppProfile> : raw as Partial<AppProfile> | undefined;
    const value = normalize(parsed);
    setActiveLeagueId(value.leagueId);
    return value;
  } catch {
    setActiveLeagueId(DEFAULT_PROFILE.leagueId);
    return DEFAULT_PROFILE;
  }
}

function persist(profile: AppProfile) {
  if (Platform.OS === "ios") {
    Settings.set({ [STORAGE_KEY]: JSON.stringify(profile) });
  }
}

type ProfileContextValue = {
  profile: AppProfile;
  saveProfile: (profile: AppProfile) => void;
  clearProfile: () => void;
  hasIdentity: boolean;
  isLofthus: boolean;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<AppProfile>(() => readStoredProfile());

  const value = useMemo<ProfileContextValue>(() => ({
    profile,
    saveProfile: (next) => {
      const normalized = normalize(next);
      setActiveLeagueId(normalized.leagueId);
      persist(normalized);
      setProfile(normalized);
    },
    clearProfile: () => {
      setActiveLeagueId(DEFAULT_PROFILE.leagueId);
      persist(DEFAULT_PROFILE);
      setProfile(DEFAULT_PROFILE);
    },
    hasIdentity: profile.entryId > 0,
    isLofthus: profile.leagueId === DEFAULT_LEAGUE_ID,
  }), [profile]);

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error("useProfile må brukes inne i ProfileProvider.");
  return value;
}
