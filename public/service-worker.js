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

self.addEventListener("install", async e => {
    const cache = await caches.open(cacheName);
    await cache.addAll(staticAssets);
    return self.skipWaiting();
})

self.addEventListener("activate", e => {
    self.clients.claim();
})

// TODO: Figure out caching strategy
self.addEventListener("fetch", async e => {
    const req = e.request;
    const url = new URL(req.url);

    if (url.origin === location.origin && url.pathname === "/stories") {
        e.respondWith(fetch(req))
    } else if (url.origin === location.origin) {
        e.respondWith(cacheFirst(req));
    } else {
        e.respondWith(networkAndCache(req));
    }
})

async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

async function networkAndCache(req) {
    const cache = await caches.open(cacheName);
    try {
        const fresh = await fetch(req);
        await cache.put(req, fresh.clone());
        return fresh;
    } catch (e) {
        const cached = await cache.match(req);
        return cached;
    }
}