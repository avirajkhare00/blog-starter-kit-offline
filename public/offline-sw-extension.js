// Enhanced service worker extension for better offline handling

// Import Workbox if available
self.importScripts && self.importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Only execute Workbox-specific code if Workbox is available
if (typeof workbox !== 'undefined') {
  console.log('Workbox is loaded in the service worker extension');
  
  // Use the workbox object directly from the imported script
  const { registerRoute, NavigationRoute, NetworkFirst, CacheFirst, StaleWhileRevalidate } = workbox.strategies;
  const { setCacheNameDetails, clientsClaim } = workbox.core;
  const { CacheableResponsePlugin } = workbox.cacheableResponse;
  const { ExpirationPlugin } = workbox.expiration;
  
  // Set cache name details
  setCacheNameDetails({
    prefix: 'blog-pwa',
    suffix: 'v1',
    precache: 'precache',
    runtime: 'runtime',
  });
  
  // Cache images with a CacheFirst strategy
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'blog-images',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
      ],
    })
  );
  
  // Cache CSS and JavaScript with a StaleWhileRevalidate strategy
  registerRoute(
    ({ request }) => 
      request.destination === 'style' || 
      request.destination === 'script',
    new StaleWhileRevalidate({
      cacheName: 'blog-static-resources',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );
  
  // Cache the API responses with a NetworkFirst strategy
  registerRoute(
    ({ url }) => url.pathname.startsWith('/api/'),
    new NetworkFirst({
      cacheName: 'blog-api',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 5 * 60, // 5 minutes
        }),
      ],
    })
  );
  
  // Special handling for post pages
  registerRoute(
    ({ url }) => url.pathname.startsWith('/posts/'),
    new NetworkFirst({
      cacheName: 'blog-posts',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        }),
      ],
    })
  );
}

// Custom navigation handler for offline fallback (works with or without Workbox)
self.addEventListener('fetch', (event) => {
  // Only handle navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      // Try the network first
      fetch(event.request)
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request)
            .then((cachedResponse) => {
              // If we have a cached version, return it
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Check if this is a post URL
              const url = new URL(event.request.url);
              const isPostUrl = url.pathname.startsWith('/posts/');
              
              // If it's a post URL, redirect to saved posts
              if (isPostUrl) {
                return caches.match('/saved-posts')
                  .then((savedPostsResponse) => {
                    if (savedPostsResponse) {
                      return savedPostsResponse;
                    }
                    // If saved-posts is not cached, fall back to offline page
                    return caches.match('/offline');
                  });
              }
              
              // For all other navigation requests, show the offline page
              return caches.match('/offline');
            });
        })
    );
  }
});

// Cache important pages for offline access
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('pages-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/offline',
        '/saved-posts',
        '/manifest.json',
        '/favicon/favicon.ico',
        '/favicon/android-chrome-192x192.png',
        '/favicon/android-chrome-512x512.png'
      ]);
    })
  );
});

console.log('Enhanced offline service worker extension loaded');
