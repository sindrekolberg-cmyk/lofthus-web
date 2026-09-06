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
  assert.ok(body.indexOf("Topp 5 sammenlagt") < body.indexOf("<MatchStrip"));
  assert.ok(body.indexOf("<MatchStrip") < body.indexOf("Snakkiser"));
  assert.doesNotMatch(home, /pulseLine/);
  assert.doesNotMatch(home, /data\.hero/);
  assert.doesNotMatch(home, /MinLofthus/);
  assert.doesNotMatch(home, /Velg deg selv/);
  assert.doesNotMatch(home, /isThisRoundPulse/);
  assert.doesNotMatch(home, /href="\/analyse\/rivalradar"/);
});
