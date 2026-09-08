export function signed(n: number) {
  if (!n) return "–";
  const abs = Math.abs(n);
  const formatted = Number.isInteger(abs)
    ? String(abs)
    : abs.toLocaleString("nb-NO", { maximumFractionDigits: 1, minimumFractionDigits: 0 });
  return n > 0 ? `+${formatted}` : `−${formatted}`;
}

export function moveLabel(n: number, provisional?: boolean) {
  void provisional;
  if (!n) return "–";
  const arrow = n > 0 ? "↑" : "↓";
  return `${arrow}${Math.abs(n)}`;
}

export function place(n: number | null | undefined) {
  if (!n) return "–";
  return `${n}.`;
}

export function storyHref(story: { manager_entry?: number; category?: string }) {
  if (story.manager_entry) return `/manager/${story.manager_entry}`;
  if ((story.category || "").toLowerCase().includes("måned")) return "/liga?view=month";
  return "/liga";
}

export function leagueOwnership(pct: number, count: number, size: number, loaded?: number) {
  if (loaded != null && size > 0 && loaded < size) {
    return `${count} av ${loaded} lastet`;
  }
  const share = Number(pct || 0).toLocaleString("nb-NO", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });
  return `${share} % (${count} av ${size})`;
}

export function ownersLabel(n: number) {
  return n === 1 ? "1 eier" : `${n} eiere`;
}

export function captainsLabel(n: number) {
  if (!n) return "";
  return n === 1 ? "1 kaptein" : `${n} kapteiner`;
}

export function monthPodiums(row: { monthly_gold: number; monthly_silver: number; monthly_bronze: number }) {
  return row.monthly_gold + row.monthly_silver + row.monthly_bronze;
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

export function storyCategory(category: string) {
  const value = (category || "").toLowerCase();
  if (value === "live") return "Live";
  if (value === "leader" || value === "month" || value.includes("måned")) return "Tabell";
  if (value === "round" || value === "runde") return "Forrige runde";
  if (value === "movement_live" || value === "movement" || value === "bevegelse") return "Tabell";
  if (value === "captain" || value === "kaptein") return "Kaptein";
  if (value === "chip") return "Chip";
  if (value === "bench" || value === "benk") return "Benk";
  if (value === "differential" || value === "unique") return "Differensial";
  if (value === "autosub") return "Autosub";
  if (value === "ownership") return "Eierskap";
  return category;
}
