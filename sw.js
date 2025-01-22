const CACHE_NAME = 'soundtrackmoods-cache-v1';
const urlsToCache = [
  'index.html',
  'manifest.json',
  'css/index_style.css',
  'assets/workout.jpg',
];

self.addEventListener('install', event => {
  event.waitUntil(
      caches.open(CACHE_NAME)
          .then(cache => {
              return cache.addAll(urlsToCache);
          })
  );
});

// Attivazione del Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
      caches.keys().then(cacheNames => {
          return Promise.all(
              cacheNames.map(cacheName => {
                  if (cacheName !== CACHE_NAME) {
                      return caches.delete(cacheName);
                  }
              })
          );
      })
  );
});

// Recupero delle risorse
self.addEventListener('fetch', event => {
  event.respondWith(
      caches.match(event.request)
          .then(response => {
              // Se c'è una corrispondenza nella cache, restituiscila; altrimenti, fetch from network
              return response || fetch(event.request);
          })
  );
});