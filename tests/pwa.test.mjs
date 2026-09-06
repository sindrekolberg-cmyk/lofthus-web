import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

test("manifest is a standalone Lofthus PWA", () => {
  const manifest = JSON.parse(read("public/manifest.webmanifest"));
  assert.equal(manifest.name, "Lofthus Road Open");
  assert.equal(manifest.short_name, "Lofthus");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.orientation, "portrait-primary");
  assert.equal(manifest.theme_color, "#f3efe6");
  assert.equal(manifest.background_color, "#f3efe6");
  const sizes = manifest.icons.map((icon) => icon.sizes);
  assert.ok(sizes.includes("192x192"));
  assert.ok(sizes.includes("512x512"));
});

test("layout metadata enables iOS web app chrome", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /appleWebApp/);
  assert.match(layout, /viewportFit: "cover"/);
  assert.match(layout, /themeColor: "#f3efe6"/);
  assert.match(layout, /apple-touch-icon/);
  assert.match(layout, /statusBarStyle: "black-translucent"/);
});

test("mobile header stays compact and bottom nav is the iPhone menu", () => {
  const header = read("components/SiteHeader.tsx");
  const nav = read("components/BottomNav.tsx");
  const types = read("lib/types.ts");
  assert.match(header, /Finn meg/);
  assert.doesNotMatch(header, /Åpne meny/);
  assert.match(nav, /App-meny/);
  assert.match(nav, /safe-area-inset-bottom/);
  assert.match(types, /label: "Analyse"/);
  assert.match(types, /href: "\/hall-of-fame"/);
});

test("service worker never caches live API responses", () => {
  const sw = read("public/sw.js");
  assert.match(sw, /lofthus-shell-/);
  assert.match(sw, /skipWaiting/);
  assert.match(sw, /clients\.claim/);
  assert.match(sw, /cache: "no-store"/);
  assert.match(sw, /onrender\.com/);
  assert.match(sw, /\/api\/stream/);
  assert.match(sw, /player-image/);
  assert.doesNotMatch(sw, /cache\.put\(request.*\/api\/home/);
});

test("offline copy does not claim stale live data is current", () => {
  const banner = read("components/OfflineBanner.tsx");
  assert.match(banner, /Du er offline/);
  assert.match(banner, /Live-data kan ikke oppdateres/);
});

test("iOS install hint is opt-in copy, not a fake install prompt", () => {
  const hint = read("components/InstallHint.tsx");
  assert.match(hint, /Legg Lofthus til på Hjem-skjermen/);
  assert.match(hint, /isStandaloneDisplay/);
  assert.doesNotMatch(hint, /beforeinstallprompt/);
});
