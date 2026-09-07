import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  fixtureNeverOngoing,
  fixtureStatusLabel,
  isPlayerFinished,
  isPlayerPlaying,
  isPlayerUpcoming,
} from "../lib/status.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("finished fixture never displays pågår", () => {
  assert.equal(fixtureNeverOngoing("finished", "Ferdig"), true);
  assert.equal(fixtureNeverOngoing("finished", "Pågår"), false);
  assert.equal(fixtureNeverOngoing("live", "Pågår"), true);
  assert.equal(fixtureStatusLabel("finished", "Pågår"), "Ferdig");
});

test("completed player is not treated as currently playing", () => {
  assert.equal(isPlayerPlaying("finished"), false);
  assert.equal(isPlayerFinished("finished"), true);
  assert.equal(isPlayerUpcoming("not_started"), true);
  assert.equal(isPlayerPlaying("live"), true);
  assert.equal(isPlayerPlaying("pause"), true);
});

test("correct navigation labels", () => {
  const types = readFileSync(join(root, "lib/types.ts"), "utf8");
  assert.match(types, /label: "Analyseverktøy"/);
  assert.match(types, /label: "Forside"/);
  assert.match(types, /label: "Liga"/);
  assert.match(types, /label: "Hall of Fame"/);
});

test("homepage uses Topp 5 sammenlagt and API talkers", () => {
  const home = readFileSync(join(root, "components/HomePage.tsx"), "utf8");
  assert.match(home, /Topp 5 sammenlagt/);
  assert.match(home, /data\.popular/);
  assert.match(home, /Hele ligaen/);
  assert.match(home, /Hele måneden/);
  assert.match(home, /Snakkiser/);
  assert.equal((home.match(/Topp 5 sammenlagt/g) || []).length, 1);
  assert.equal((home.match(/Hele måneden/g) || []).length, 1);
  const body = home.slice(home.indexOf("return ("));
  assert.ok(body.indexOf("<MatchStrip") < body.indexOf("Topp 5 sammenlagt"));
  assert.ok(body.indexOf("Topp 5 sammenlagt") < body.indexOf("Snakkiser"));
  assert.ok(body.indexOf("Snakkiser") < body.indexOf("Største utslag"));
  assert.match(home, /lg:grid-cols-\[minmax\(0,1\.85fr\)_minmax\(12rem,1fr\)\]/);
  assert.match(home, /Største klatrere/);
  assert.match(home, /Største fall/);
  assert.doesNotMatch(home, /Foreløpig endring akkurat nå/);
  assert.match(home, /data\.pulse\?\.fixtures/);
  assert.doesNotMatch(home, /data\.events\?\.length/);
  assert.doesNotMatch(home, /pulseLine/);
  assert.doesNotMatch(home, /data\.hero/);
  assert.doesNotMatch(home, /MinLofthus/);
  assert.doesNotMatch(home, /Velg deg selv/);
  assert.doesNotMatch(home, /isThisRoundPulse/);
  assert.doesNotMatch(home, /href="\/analyse\/rivalradar"/);
});

test("header does not duplicate liga match strip and LIVE is football-only", () => {
  const header = readFileSync(join(root, "components/SiteHeader.tsx"), "utf8");
  const banner = readFileSync(join(root, "components/EventBanner.tsx"), "utf8");
  const liga = readFileSync(join(root, "app/liga/page.tsx"), "utf8");
  assert.match(header, /pathname.startsWith\("\/liga"\)/);
  assert.match(liga, /<MatchStrip/);
  assert.match(banner, /footballLive/);
  assert.doesNotMatch(banner, /sseOpen/);
  assert.doesNotMatch(banner, /useLofthus/);
});

test("hall of fame shows merits instead of an invented points score", () => {
  const hof = readFileSync(join(root, "app/hall-of-fame/page.tsx"), "utf8");
  assert.match(hof, /Ligatitler/);
  assert.match(hof, /Cupgull/);
  assert.match(hof, /Månedspodier/);
  assert.doesNotMatch(hof, /Totalt antall poeng/);
  assert.doesNotMatch(hof, /poengsystem/);
  assert.doesNotMatch(hof, /historicalPoints/);
});

test("hall of fame keeps four tabs and no random placement", () => {
  const hof = readFileSync(join(root, "app/hall-of-fame/page.tsx"), "utf8");
  assert.match(hof, /id: "overview"/);
  assert.match(hof, /id: "seasons"/);
  assert.match(hof, /id: "month"/);
  assert.match(hof, /id: "cup"/);
  assert.doesNotMatch(hof, /id: "random"/);
  assert.doesNotMatch(hof, /id: "managers"/);
});

test("rivalradar shows three distinct gaps", () => {
  const page = readFileSync(join(root, "app/analyse/rivalradar/page.tsx"), "utf8");
  assert.match(page, /Før runden/);
  assert.match(page, /Denne runden/);
  assert.match(page, /Live-avstand/);
  assert.match(page, /pre_gw_gap/);
  assert.doesNotMatch(page, /Avstand totalt/);
});
