export function signed(n: number) {
  if (n > 0) return `+${n}`;
  if (n < 0) return `${n}`;
  return "–";
}

export function moveLabel(n: number, provisional: boolean) {
  if (!n) return "–";
  const arrow = n > 0 ? "↑" : "↓";
  const abs = Math.abs(n);
  if (provisional) return `${arrow}${abs}`;
  return `${arrow}${abs}`;
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
