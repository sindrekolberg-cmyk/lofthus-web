import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { analysisEntries } from "../lib/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

test("transferstrategi is an analysis tool, not top-level nav", () => {
  const hrefs = analysisEntries.map((e) => e.href);
  assert.equal(hrefs.includes("/analyse/transferstrategi"), true);
  const nav = readFileSync(join(root, "lib/types.ts"), "utf8");
  assert.match(nav, /kicker: "Neste trekk"/);
  assert.match(nav, /title: "Transferstrategi"/);
  assert.match(nav, /href: "\/analyse"/);
  const board = readFileSync(join(root, "components/TransferStrategyBoard.tsx"), "utf8");
  assert.match(board, /Hva prøver du å oppnå/);
  assert.match(board, /Risikovilje/);
  assert.match(board, /api\.analysisTransfers/);
  assert.match(board, /Anbefalt trekk/);
  assert.doesNotMatch(board, /Expected points/);
  const api = readFileSync(join(root, "lib/api.ts"), "utf8");
  assert.match(api, /\/api\/analysis\/transfers/);
});
