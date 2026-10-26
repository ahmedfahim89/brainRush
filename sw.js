// BrainRush service worker (US-40, D-43): an offline page, nothing else.
// It lives at the site root (not in js/), because the pre-commit hook gives every js/*.js a
// content-hashed name and a service worker needs a fixed URL; its scope is this folder.
// - Install: cache offline.html only (in a versioned cache; activate deletes older ones).
// - Fetch: only page loads (navigations) are handled, always from the network; when that fails,
//   offline.html is shown. Nothing else is cached or touched: api/ calls, scripts, styles and
//   pictures go to the network as if there were no service worker.
// Change CACHE (v2, v3, ...) whenever offline.html changes, so phones fetch the new copy.
'use strict';

const CACHE = 'brainrush-offline-v1';
const CACHE_PREFIX = 'brainrush-offline-';
const OFFLINE_URL = new URL('offline.html', self.registration.scope).href;
const API_URL = new URL('api/', self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.add(new Request(OFFLINE_URL, { cache: 'reload' })))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.mode !== 'navigate' || request.method !== 'GET' || request.url.startsWith(API_URL)) return;
  event.respondWith(
    fetch(request).catch(() => caches.open(CACHE)
      .then((cache) => cache.match(OFFLINE_URL))
      .then((page) => page || Response.error()))
  );
});
