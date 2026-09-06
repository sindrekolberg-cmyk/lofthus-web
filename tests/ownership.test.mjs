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
import { leagueOwnership } from "../lib/format.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("finished fixture displays Ferdig, not Pågår", () => {
  assert.equal(fixtureStatusLabel("finished", "Pågår"), "Ferdig");
  assert.equal(fixtureNeverOngoing("finished", "Ferdig"), true);
  assert.equal(isPlayerPlaying("finished"), false);
  assert.equal(isPlayerFinished("finished"), true);
});

test("live GW labels are not used for fixture status", () => {
  assert.equal(fixtureStatusLabel("live"), "Pågår");
  assert.equal(fixtureStatusLabel("not_started"), "Ikke startet");
  assert.equal(fixtureStatusLabel("pause"), "Pause");
  assert.equal(isPlayerUpcoming("not_started"), true);
  assert.equal(isPlayerPlaying("live"), true);
});

test("ownership percentage uses current league membership", () => {
  assert.equal(leagueOwnership(1.6, 1, 63), "1,6 % (1 av 63)");
  assert.equal(leagueOwnership(87, 55, 63), "87 % (55 av 63)");
});

test("GW points and status stay separate columns", () => {
  const table = readFileSync(join(root, "components/OwnershipTable.tsx"), "utf8");
  assert.match(table, />Spiller</);
  assert.match(table, />Klubb</);
  assert.match(table, />Eierandel i ligaen</);
  assert.match(table, />Eiere</);
  assert.match(table, />GW</);
  assert.match(table, />Status</);
  assert.doesNotMatch(table, /EID|GWSTATUS/);
  assert.doesNotMatch(table, /event_points\}\s*\{.*fixture_status/);
  assert.match(table, /tabular-nums">\{p\.event_points\}/);
  assert.match(table, /const status = fixtureStatusLabel/);
});

test("desktop header nav uses Analyseverktøy", () => {
  const header = readFileSync(join(root, "components/SiteHeader.tsx"), "utf8");
  const types = readFileSync(join(root, "lib/types.ts"), "utf8");
  assert.match(types, /label: "Analyseverktøy"/);
  assert.match(header, /item\.label/);
  assert.match(header, /text-\[15px\]/);
  assert.match(header, /md:h-\[72px\]/);
  assert.match(header, /ROAD OPEN/);
  assert.doesNotMatch(header, /label: "Analyse"/);
});
