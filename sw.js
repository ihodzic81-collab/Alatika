// ============================================================
// ALATIKA 3.0 — Service Worker
// Verzija keša: v12
// ============================================================

const CACHE_NAME = 'alatika-v12';

const URLS_TO_CACHE = [
    './',
    './index.html',
    './style.css?v=12',
    './app.js?v=12',
    './translations.js?v=12',
    './manifest.json',
    './apple-touch-icon.png',
    './web-app-manifest-192x192.png',
    './web-app-manifest-512x512.png'
];

// ============================================================
// INSTALL — keširaj sve fajlove
// ============================================================
self.addEventListener('install', (event) => {
    console.log('[SW] Installing version:', CACHE_NAME);
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(URLS_TO_CACHE).catch((err) => {
                console.warn('[SW] Failed to cache some URLs:', err);
            });
        }).then(() => {
            // Odmah aktiviraj novi SW (ne čekaj da se stari zatvori)
            return self.skipWaiting();
        })
    );
});

// ============================================================
// ACTIVATE — obriši stare keševe
// ============================================================
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating version:', CACHE_NAME);
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Preuzmi kontrolu nad svim otvorenim tabovima
            return self.clients.claim();
        })
    );
});

// ============================================================
// FETCH — strategija: Cache First, Network Fallback
// ============================================================
self.addEventListener('fetch', (event) => {
    // Preskoči non-GET zahteve
    if (event.request.method !== 'GET') {
        return;
    }

    // Preskoči eksterne domene (API pozivi: open-meteo, er-api, itd.)
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) {
        // Za eksterne API pozive — koristi network direktno (ne keširaj)
        return;
    }

    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Vrati iz keša
                return cachedResponse;
            }

            // Nije u kešu — fetch sa mreže
            return fetch(event.request).then((networkResponse) => {
                // Ne keširaj ako nije uspešan odgovor
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                // Kloniraj i keširaj
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return networkResponse;
            }).catch(() => {
                // Ako nema mreže a nije u kešu — fallback na index.html (SPA)
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain' })
                });
            });
        })
    );
});

// ============================================================
// MESSAGE — omogući ručno preskakanje čekanja
// ============================================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
