// QF Inteli Terminal service worker.
//
// Scope is deliberately narrow: cache the static app shell only
// (HTML/CSS/JS bundles, icons) so "add to home screen" launches feel
// instant. It NEVER caches API responses (/api/*) — market/news/macro/
// sentiment/event data always goes to the network. If the network is
// unavailable, those fetches fail and the app's own DataState handling
// shows OFFLINE / NO DATA. This file must never serve stale financial
// data as if it were current.

const SHELL_CACHE = "qf-inteli-shell-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SHELL_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never intercept API calls — always hit the network for real data.
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // Cache-first for same-origin static assets only.
  if (url.origin === self.location.origin && event.request.method === "GET") {
    event.respondWith(
      caches.open(SHELL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch (err) {
          if (cached) return cached;
          throw err;
        }
      })
    );
  }
});
