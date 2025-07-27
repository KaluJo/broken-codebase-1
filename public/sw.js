const CACHE_NAME = 'admin-panel-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Service worker installation - force immediate activation
self.addEventListener('install', (event) => {
  // Skip waiting to immediately take control
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// Force immediate control of all clients
self.addEventListener('activate', (event) => {
  // Claim all clients immediately to take control in dev mode
  event.waitUntil(
    clients.claim().then(() => {
      return caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      });
    })
  );
});

// Enhanced fetch handler with smart routing optimizations
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Only handle requests from our domain
  if (url.origin !== location.origin) {
    return;
  }
  
  // REDIRECT ANY URL WITH QUERY PARAMETERS TO ROOT
  if (url.search) {    
    // For navigation requests, redirect to homepage
    if (event.request.mode === 'navigate' || event.request.destination === 'document') {
      event.respondWith(
        Response.redirect('/', 302)
      );
      return;
    }
    
    // For other requests, serve homepage content
    event.respondWith(
      caches.match('/').then((response) => {
        if (response) {
          return response;
        }
        return fetch('/');
      })
    );
    return;
  }
  
  // Normal caching behavior for requests without query parameters
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
}); 