/** Official Premier League crest URLs, same CDN as FPL player cut-outs. */

const SHORT_TO_CODE: Record<string, number> = {
  ARS: 3,
  AVL: 7,
  BOU: 91,
  BRE: 94,
  BHA: 36,
  BUR: 90,
  CHE: 8,
  CRY: 31,
  EVE: 11,
  FUL: 54,
  LEE: 2,
  LEI: 13,
  LIV: 14,
  MCI: 43,
  MUN: 1,
  NEW: 4,
  NFO: 17,
  SOU: 20,
  SUN: 56,
  TOT: 6,
  WHU: 21,
  WOL: 39,
  IPS: 40,
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
