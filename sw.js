// ============================================================
// ALATIKA — Service Worker
// Offline keširanje + PWA podrška
// ============================================================

const CACHE_NAME = 'alatika-v4';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './translations.js',
    './manifest.json'
];

// Instalacija — keširaj sve fajlove
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => console.warn('SW install cache greška:', err))
    );
});

// Aktivacija — obriši stare keševe
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// Fetch — posluži iz keša, u pozadini osveži
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Ne keširaj API pozive (weather, FX, geocoding)
    if (req.url.includes('api.open-meteo.com') ||
        req.url.includes('air-quality-api') ||
        req.url.includes('open.er-api.com') ||
        req.url.includes('nominatim.openstreetmap.org') ||
        req.url.includes('geocoding-api')) {
        return;
    }

    if (req.method !== 'GET') return;

    event.respondWith(
        caches.match(req).then(cached => {
            const network = fetch(req)
                .then(res => {
                    // Keširaj samo uspešne odgovore
                    if (res && res.status === 200 && res.type === 'basic') {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(req, clone));
                    }
                    return res;
                })
                .catch(() => cached); // Ako nema interneta, vrati keš
            return cached || network;
        })
    );
});

// Poruke od klijenta
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
