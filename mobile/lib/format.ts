import { colors } from "./theme";

export function formatMovement(change: number) {
  if (!change) return { text: "–", color: colors.muted };
  if (change > 0) return { text: `+${change} ▲`, color: colors.green };
  return { text: `${change} ▼`, color: colors.live };
}

export function clubBadge(code: string, fullName?: string) {
  const short = code.trim().toUpperCase();
  if (short && short.length <= 4 && !short.includes(" ")) return short;
  const source = (fullName || code).trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return parts.slice(0, 3).map((part) => part[0]?.toUpperCase() || "").join("");
  return source.slice(0, 3).toUpperCase() || "?";
}

export function formatKickoff(kickoff?: string) {
  if (!kickoff) return "";
  const date = new Date(kickoff);
  if (Number.isNaN(date.getTime())) return "";
  const weekday = new Intl.DateTimeFormat("nb-NO", { weekday: "short" }).format(date).replace(".", "").toUpperCase();
  const time = new Intl.DateTimeFormat("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false }).format(date);
  return `${weekday} ${time}`;
}

export function formatPlace(place: number) {
  return `${place}. plass`;
}

export function namesList(value?: string) {
  return (value || "")
    .split(/\s*(?:\/|,|&)\s*/)
    .map((name) => name.trim())
    .filter(Boolean);
}

export function nameMatches(value: string | undefined, manager: string) {
  const needle = manager.trim().toLocaleLowerCase("nb");
  return namesList(value).some((name) => name.toLocaleLowerCase("nb") === needle);
}

export function newestSeasonFirst(a: string, b: string) {
  return b.localeCompare(a, "nb");
}
