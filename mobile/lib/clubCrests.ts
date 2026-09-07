/** Official Premier League crest URLs. Codes from FPL bootstrap-static 2026/27. */

const SHORT_TO_CODE: Record<string, number> = {
  ARS: 3,
  AVL: 7,
  BOU: 91,
  BRE: 94,
  BHA: 36,
  CHE: 8,
  COV: 9,
  CRY: 31,
  EVE: 11,
  FUL: 54,
  HUL: 88,
  IPS: 40,
  LEE: 2,
  LIV: 14,
  MCI: 43,
  MUN: 1,
  NEW: 4,
  NFO: 17,
  TOT: 6,
  SUN: 56,
};

export function plBadgeUrl(code?: number | null) {
  if (!code) return "";
  return `https://resources.premierleague.com/premierleague/badges/70/t${code}.png`;
}

export function crestUri(opts: { badge?: string; code?: number; short?: string }) {
  if (opts.badge) return opts.badge;
  if (opts.code) return plBadgeUrl(opts.code);
  const mapped = SHORT_TO_CODE[(opts.short || "").trim().toUpperCase()];
  return mapped ? plBadgeUrl(mapped) : "";
}

export function playerThumb(url?: string) {
  if (!url) return "";
  return url.replace("/500x500/", "/110x140/").replace("/250x250/", "/110x140/");
}

export function playerImageCandidates(url?: string) {
  const primary = playerThumb(url);
  if (!primary) return [];
  const match = primary.match(/\/(?:p)?(\d+)\.png(?:\?.*)?$/i);
  const id = match?.[1];
  const extra = id
    ? [`https://resources.premierleague.com/premierleague/photos/players/110x140/p${id}.png`]
    : [];
  return [primary, ...extra.filter((item) => item !== primary)];
}
