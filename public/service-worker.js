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
    const url = new URL(req.url);

    // local URLs use cacheFirst strategy
    if (url.origin === location.origin) {
        e.respondWith(cacheFirst(req));
    }
    // remote URLs use networkAndCache stategy
    else {
        e.respondWith(networkAndCache(req));
    }
})

// Fetches from the cache or makes a network request if not available
async function cacheFirst(req) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(req);
    return cached || fetch(req);
}

// Fetches from the network then caches
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