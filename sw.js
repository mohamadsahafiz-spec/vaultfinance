const CACHE_NAME = 'vault-cache-v3';
const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './favicon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      ASSETS_TO_CACHE.forEach(asset => cache.add(asset).catch(err => console.log('Skipped:', asset)));
    })
  );
});

// Delete old caches when the new one takes over
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim())
  );
});

// NETWORK-FIRST STRATEGY: Always get the freshest code if online
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Save the fresh code to the offline cache silently
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return networkResponse;
      })
      .catch(() => {
        // If offline, use the saved cache
        return caches.match(event.request);
      })
  );
});
