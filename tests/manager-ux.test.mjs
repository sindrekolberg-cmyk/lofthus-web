import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("bench slots display event points, not zeroed contribution", () => {
  const pitch = readFileSync(join(root, "components/SquadPitch.tsx"), "utf8");
  assert.match(pitch, /onPitch \? player\.gw_contribution : player\.event_points/);
  assert.match(pitch, /AUTO IN/);
  assert.match(pitch, /inn for \$\{player\.replaced_player\}/);
  assert.doesNotMatch(pitch, /unplayed \? "–" : player\.gw_contribution/);
});

test("form distinguishes overall league place from round rank", () => {
  const page = readFileSync(join(root, "app/manager/[entryId]/page.tsx"), "utf8");
  assert.match(page, /sammenlagt/);
  assert.match(page, /best i runden/);
  assert.doesNotMatch(page, /i Lofthus/);
  assert.match(page, /row\.round_rank/);
  assert.match(page, /row\.league_rank/);
});

test("league table keeps Plass column but not Plass sort", () => {
  const table = readFileSync(join(root, "components/LeagueTable.tsx"), "utf8");
  assert.match(table, />Plass</);
  assert.doesNotMatch(table, /id: "rank", label: "Plass"/);
  assert.match(table, /useState<SortKey>\("total"\)/);
  assert.match(table, /id: "total", label: "Totalpoeng"/);
  assert.match(table, /id: "gw", label: "Rundepoeng"/);
});
