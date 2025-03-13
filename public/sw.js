// This is the service worker with the combined offline experience (Offline page + Offline copy of pages)

const CACHE = "pwabuilder-offline";

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// This is your Service Worker, you can put any of your custom Service Worker
// code in this file, for example handling offline fallbacks

// Ensure we are using the correct cacheName for PWA assets
workbox.core.setCacheNameDetails({
  prefix: 'blog-pwa',
});

// Start controlling the clients as soon as the SW is ready
self.addEventListener('install', event => {
  // Precache the offline page
  event.waitUntil(
    caches.open('offline-pages').then((cache) => {
      return cache.add('/offline');
    })
  );
  self.skipWaiting();
});

// These are the routes we are going to cache for offline support
workbox.routing.registerRoute(
  ({request}) => request.mode === 'navigate',
  new workbox.strategies.NetworkFirst({
    cacheName: 'pages',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ],
    networkTimeoutSeconds: 3, // Timeout after 3 seconds
    // Return the offline page if the network request fails
    async fetchDidFail() {
      return caches.match('/offline');
    }
  })
);

// Cache CSS, JS, and Web Worker requests with a Stale While Revalidate strategy
workbox.routing.registerRoute(
  ({request}) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'worker',
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// Cache images with a Cache First strategy
workbox.routing.registerRoute(
  ({request}) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache blog posts with a Cache First strategy to ensure they're available offline
workbox.routing.registerRoute(
  ({url}) => url.pathname.startsWith('/posts/'),
  new workbox.strategies.CacheFirst({
    cacheName: 'blog-posts',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

// Cache the homepage with a Network First strategy
workbox.routing.registerRoute(
  ({url}) => url.pathname === '/' || url.pathname === '/index.html',
  new workbox.strategies.NetworkFirst({
    cacheName: 'homepage',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 5,
        maxAgeSeconds: 24 * 60 * 60 // 24 hours
      })
    ]
  })
);

// This "catch" handler is triggered when any of the other routes fail to
// generate a response
workbox.routing.setCatchHandler(async ({event}) => {
  // The FALLBACK_URL entries must be added to the cache ahead of time, either
  // via runtime or precaching. If they are precached, then call
  // `matchPrecache(FALLBACK_URL)` (from the `workbox-precaching` package)
  // to get the response from the correct cache.
  //
  // Use event, request, and url to figure out how to respond.
  // One approach would be to use request.destination, see
  // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
  switch (event.request.destination) {
    case 'document':
      // Return the offline page for navigation requests
      return caches.match('/offline') || caches.match('/') || Response.error();
    case 'image':
      // If using precached URLs:
      // return matchPrecache('/static/images/fallback.png');
      return new Response('', {
        status: 499,
        statusText: 'offline, image not available'
      });
    case 'font':
    // If using precached URLs:
    // return matchPrecache(FALLBACK_FONT);
    default:
      // If we don't have a fallback, just return an error response.
      return Response.error();
  }
});
