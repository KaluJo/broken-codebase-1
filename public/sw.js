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
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Serve from cache when available for optimal performance
        if (response) {
          return response;
        }
        
        const url = new URL(event.request.url);
        
        // Smart SPA routing enhancement for better performance
        if (url.search && url.pathname !== '/') {
          // Serve cached homepage for parameterized routes
          return caches.match('/');
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