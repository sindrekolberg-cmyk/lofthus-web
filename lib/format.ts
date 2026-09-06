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

export function ownersLabel(n: number) {
  return n === 1 ? "1 eier" : `${n} eiere`;
}

export function captainsLabel(n: number) {
  if (!n) return "";
  return n === 1 ? "1 kaptein" : `${n} kapteiner`;
}

export function storyCategory(category: string) {
  const value = (category || "").toLowerCase();
  if (value === "live") return "Live";
  if (value === "round" || value === "runde") return "Forrige runde";
  if (value === "movement" || value === "bevegelse") return "Bevegelse";
  if (value === "month" || value.includes("måned")) return "Måned";
  if (value === "captain" || value === "kaptein") return "Kaptein";
  return category;
}
