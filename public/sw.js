const CACHE_NAME = 'admin-panel-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Service worker installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Enhanced fetch handler with smart routing optimizations
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Bug: Force redirect to homepage for any URL with query parameters (for direct navigation)
  if (url.search && (event.request.mode === 'navigate' || event.request.destination === 'document')) {
    event.respondWith(
      Response.redirect('/', 302)
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Serve from cache when available for optimal performance
        if (response) {
          return response;
        }
        
        // Bug: Also catch any other requests with query parameters
        if (url.search) {
          // Serve cached homepage for any parameterized routes
          return caches.match('/').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return fetch('/');
          });
        }
        
        // Fallback to network for uncached resources
        return fetch(event.request);
      })
  );
});

// Cleanup handler
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 