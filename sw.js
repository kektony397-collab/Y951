
const CACHE_NAME = 'repido-meter-cache-v1';
// Note: Icon files referenced in manifest.json should also be added here if available.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx', // Caching the main script
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&family=Roboto:wght@400;700&display=swap',
];

// Install event: opens a cache and adds the core app shell files to it.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => {
        console.error('Failed to cache app shell:', err);
      })
  );
});

// Fetch event: serves requests from the cache first, falling back to the network.
// Updates the cache with new network responses.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Not in cache - fetch from network
        return fetch(event.request).then(
          networkResponse => {
            // Check if we received a valid response
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            // Clone the response because it's a stream and can only be consumed once.
            const responseToCache = networkResponse.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Cache the new response for future requests.
                // We use put() instead of add() as we already have the response.
                cache.put(event.request, responseToCache);
              });

            return networkResponse;
          }
        ).catch(error => {
          console.error('Fetching failed:', error);
          // You could return a custom offline page here if you had one cached.
        });
      })
  );
});

// Activate event: cleans up old, unused caches.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
