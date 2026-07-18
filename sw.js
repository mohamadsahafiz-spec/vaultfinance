const CACHE_NAME = 'vault-cache-v2'; // Bumped version to force a reset

const ASSETS_TO_CACHE = [
  './index.html',
  './manifest.json',
  './favicon.png'
];

self.addEventListener('install', (event) => {
  // Force this new worker to take over immediately
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Forgiving cache: add files one by one. If one fails, it won't crash the install.
      ASSETS_TO_CACHE.forEach(asset => {
          cache.add(asset).catch(err => console.error('Skipping cache for:', asset));
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  // Take control of the page immediately
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
