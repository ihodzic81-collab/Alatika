// ============================================================
// ALATIKA 2.0 — Service Worker
// Offline keširanje + PWA podrška
// ============================================================

const CACHE_NAME = 'alatika-v9';

// Lista fajlova koji se keširaju pri instalaciji
const ASSETS = [
    './',
    './index.html',
    './style.css?v=9',
    './app.js?v=9',
    './translations.js?v=9',
    './manifest.json',
    './web-app-manifest-192x192.png',
    './web-app-manifest-512x512.png',
    './apple-touch-icon.png'
];

// ============================================================
// INSTALL — keširaj sve fajlove
// ============================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                // Keširaj fajlove jedan po jedan da greška u jednom ne blokira ostale
                return Promise.all(
                    ASSETS.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn('SW: nije mogao keširati', url, err);
                        });
                    })
                );
            })
            .then(() => self.skipWaiting())
            .catch(err => console.warn('SW install greška:', err))
    );
});

// ============================================================
// ACTIVATE — obriši stare keševe
// ============================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(k => k !== CACHE_NAME && k.startsWith('alatika-'))
                    .map(k => {
                        console.log('SW: brišem stari keš', k);
                        return caches.delete(k);
                    })
            ))
            .then(() => self.clients.claim())
    );
});

// ============================================================
// FETCH — strategija: cache-first za lokalne, network-only za API
// ============================================================
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // 1) Ne keširaj API pozive (weather, FX, geocoding)
    if (req.url.includes('api.open-meteo.com') ||
        req.url.includes('air-quality-api') ||
        req.url.includes('open.er-api.com') ||
        req.url.includes('nominatim.openstreetmap.org') ||
        req.url.includes('geocoding-api')) {
        return; // idi direktno na mrežu
    }

    // 2) Ne keširaj ništa što nije GET
    if (req.method !== 'GET') return;

    // 3) Ne keširaj chrome-extension:// i sl.
    if (!req.url.startsWith('http')) return;

    event.respondWith(
        caches.match(req).then(cached => {
            // Uvek pokušaj mrežu u pozadini (da bi se keš osvežio)
            const networkPromise = fetch(req)
                .then(res => {
                    // Keširaj samo uspešne odgovore sa lokalnog origin-a
                    if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => {
                            c.put(req, clone).catch(err => {
                                // Ignoriši greške (npr. nepodržani scheme)
                            });
                        });
                    }
                    return res;
                })
                .catch(() => null);

            // Ako imamo keš — vrati keš odmah, mreža se osvežava u pozadini
            if (cached) {
                return cached;
            }

            // Ako nemamo keš — čekaj mrežu
            return networkPromise.then(res => {
                if (res) return res;

                // Ako nema ni keša ni mreže — za navigacione zahteve vrati index.html
                if (req.mode === 'navigate') {
                    return caches.match('./index.html');
                }

                // Fallback: prazan odgovor
                return new Response('Offline — resurs nije dostupan.', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' })
                });
            });
        })
    );
});

// ============================================================
// MESSAGE — komunikacija sa klijentom (app.js)
// ============================================================
self.addEventListener('message', (event) => {
    if (!event.data) return;

    // Skip waiting — forsiraj novu verziju SW-a
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Clear cache — očisti sve keševe (ručno iz app-a)
    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then(keys => Promise.all(keys.map(k => caches.delete(k))))
                .then(() => {
                    // Obavesti klijenta
                    if (event.source) {
                        event.source.postMessage({ type: 'CACHE_CLEARED' });
                    }
                })
        );
    }

    // Cache URLs — dinamički dodaj u keš
    if (event.data.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
        event.waitUntil(
            caches.open(CACHE_NAME).then(cache => {
                return Promise.all(
                    event.data.urls.map(url => {
                        return cache.add(url).catch(err => {
                            console.warn('SW: nije mogao keširati', url, err);
                        });
                    })
                );
            })
        );
    }
});

// ============================================================
// SYNC — (opciono) pozadinska sinhronizacija
// ============================================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-reminders') {
        // Ovde bi mogla ići logika za pozadinsku sinhronizaciju podsetnika
        // Za sada — samo log
        console.log('SW: sync-reminders pozvan');
    }
});

// ============================================================
// KRAJ sw.js
// ============================================================
