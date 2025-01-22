const CACHE_NAME = 'v2'; // Aggiorna il numero di versione quando cambi i file da cache
const urlsToCache = [
  'index.html',
  'manifest.json',
  'css/index_style.css'
];

// Installazione del service worker e caching dei file
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// Intercetta le richieste e risponde con i file dalla cache
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Controlla se la richiesta è in cache, altrimenti effettua una richiesta di rete
      return response || fetch(event.request);
    })
  );
});

// Aggiornamento del service worker e gestione della cache
self.addEventListener('activate', function (event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('install', (event) => {
  self.skipWaiting(); // Forza l'attivazione del nuovo Service Worker
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Assicura che il nuovo SW prenda il controllo
});

// Invia un messaggio al client quando l'installazione è completata
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
