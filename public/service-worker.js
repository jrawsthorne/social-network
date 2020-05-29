const cacheName = 'social-v2';
const staticAssets = [
    "./manifest.json",
    "./",
    "./me",
    "./login",
    "./register",
    "./favicon.ico",
    "./stylesheets/style.css",
    "./socket.io/socket.io.js",
    "./js/app.js",
    "./js/database.js",
    "./js/index.js",
    "./js/login.js",
    "./js/register.js",
    "./js/idb.js",
    "./js/me.js",
    "./js/wrap-idb-value.js"
]

// Allow website to work offline
self.addEventListener("install", async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
})

self.addEventListener("activate", e => {
    self.clients.claim();
})

// Intercepts fetch requests and caches them, except stories
self.addEventListener("fetch", async e => {
    const req = e.request;
    e.respondWith(staleWhileFetching(req));
})

// Serves stale content which is refreshed and displayed on next load
async function staleWhileFetching(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    (async () => {
        // update the cache with fresh content
        try {
            const fresh = await fetch(req);
            await cache.put(req, fresh);
        } catch (e) { }
    })();
    // if req cached return cached otherwise make a network request
    return cached || fetch(req);
}