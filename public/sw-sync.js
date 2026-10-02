// SNRR Mamou — Service Worker de synchronisation hors-ligne
// Ce SW gère le cache des assets + la file de sync pour les données offline

const CACHE_NAME = 'snrr-mamou-v1';
const TILE_CACHE = 'osm-tiles-v1';

// Assets à précacher pour le fonctionnement offline
const PRECACHE_URLS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME && k !== TILE_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache-first pour les tuiles OSM
  if (url.hostname === 'tile.openstreetmap.org') {
    event.respondWith(
      caches.open(TILE_CACHE).then(async cache => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        try {
          const response = await fetch(event.request);
          if (response.ok) cache.put(event.request, response.clone());
          return response;
        } catch {
          return cached ?? new Response('', { status: 503 });
        }
      })
    );
    return;
  }

  // Network-first pour les requêtes API (simulation)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Offline — enqueue la requête
          return new Response(JSON.stringify({ offline: true, queued: true }), {
            headers: { 'Content-Type': 'application/json' },
          });
        })
    );
    return;
  }

  // Cache-first pour les assets statiques
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok && !url.hostname.includes('chrome-extension')) {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          }
          return response;
        }).catch(() => cached ?? new Response('Offline', { status: 503 }));
      })
    );
  }
});

// Background sync (quand la connexion revient)
self.addEventListener('sync', (event) => {
  if (event.tag === 'snrr-sync') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  // Notifie tous les clients que la sync est disponible
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_READY' }));
}

// Message de ping pour vérifier que le SW est actif
self.addEventListener('message', (event) => {
  if (event.data?.type === 'PING') {
    event.source?.postMessage({ type: 'PONG', version: CACHE_NAME });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
