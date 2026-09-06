/* Lofthus PWA service worker.
   Live FPL/API responses are never cached.
   Static shell uses a versioned cache so new deploys replace old assets. */

const VERSION = new URL(self.location).searchParams.get("v") || "dev";
const SHELL = `lofthus-shell-${VERSION}`;

const PRECACHE = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

function isLiveRequest(url) {
  if (url.protocol !== "http:" && url.protocol !== "https:") return false;
  const host = url.hostname;
  if (host.includes("onrender.com") || host.includes("localhost") && url.port === "8000") return true;
  if (url.pathname.startsWith("/api/stream")) return true;
  if (url.pathname.startsWith("/api/") && !url.pathname.startsWith("/api/player-image")) {
    return true;
  }
  return false;
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".webmanifest") ||
    url.pathname === "/header-premier-league.jpg"
  );
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (isLiveRequest(url)) {
    event.respondWith(fetch(request, { cache: "no-store" }));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.open(SHELL).then(async (cache) => {
        const cached = await cache.match(request);
        const networked = fetch(request)
          .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => cached);
        return cached || networked;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(SHELL).then((cache) => cache.put("/", copy)).catch(() => {});
          return response;
        })
        .catch(async () => {
          const cached = (await caches.match(request)) || (await caches.match("/"));
          return (
            cached ||
            new Response("Du er offline", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }),
    );
  }
});
