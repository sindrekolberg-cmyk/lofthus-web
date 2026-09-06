import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { fixtureStatusLabel, isFixtureFinished, isFixtureLive } from "../lib/status.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("finished fixture stays Ferdig even when shown as recent", () => {
  assert.equal(fixtureStatusLabel("finished", "Pågår"), "Ferdig");
  assert.equal(isFixtureFinished("finished"), true);
  assert.equal(isFixtureLive("finished"), false);
});

test("match card click opens portal detail for the fixture id", () => {
  const strip = readFileSync(join(root, "components/MatchStrip.tsx"), "utf8");
  const detail = readFileSync(join(root, "components/MatchDetail.tsx"), "utf8");
  assert.match(strip, /setOpenId\(fixture\.id\)/);
  assert.match(strip, /api\.match\(openId/);
  assert.match(strip, /match\.data\?\.fixture\?\.id === openId/);
  assert.match(strip, /createPortal/);
  assert.match(strip, /<MatchDetail/);
  assert.doesNotMatch(strip, /pushState/);
  assert.match(detail, /data-fixture-id/);
  assert.match(detail, /Lukk/);
  assert.match(detail, /Escape/);
  assert.match(detail, /Lofthus-puls/);
  assert.match(detail, /owner\.is_captain/);
  assert.match(detail, /is_triple_captain/);
  assert.doesNotMatch(detail, /Live · /);
});
