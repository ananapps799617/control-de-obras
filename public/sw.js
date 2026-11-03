// ============================================================
// SERVICE WORKER — CONTROL DE OBRAS PWA v7
// Qué hace: Permite cache de respuestas CORS/Opaque en celulares Android.
// Por técnicos: Cumple ORDEN #006 de Gerencia para romper bucle de vista.
// ============================================================
const CACHE_NAME = 'control-obras-v7';

const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Para navegaciones de página principal en celulares
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('/index.html', clone));
          }
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Para recursos estáticos: Network first con fallback seguro a cache (compatible Android)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && (response.status === 200 || response.type === 'opaque')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
