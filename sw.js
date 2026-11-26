// Mokh Rush service worker (US-40, D-43): an offline page, and the Phone buzzer join page (US-52).
// It lives at the site root (not in js/), because the pre-commit hook gives every js/*.js a
// content-hashed name and a service worker needs a fixed URL; its scope is this folder.
// - Install: cache offline.html (in a versioned cache; activate deletes older ones).
// - Fetch: page loads (navigations) always go to the network first; when that fails, offline.html is
//   shown. Join page (US-52): each join.html that loads is kept in JOIN_CACHE, together with the
//   scripts and styles it loads (requests whose referrer is join.html, also network first). So the
//   cached page always matches the cached files, and a phone that loses the network on a reload gets
//   the join page back: it keeps its name and reconnects by itself once the network is back. The
//   asset names are content-hashed, so this file never lists them; an older copy of a file is replaced.
// - Nothing else is cached or touched: api/ calls (api/rooms.php above all: always live), the game's
//   own scripts and styles, and pictures go to the network as if there were no service worker.
// Change CACHE (v2, v3, ...) whenever offline.html changes, so phones fetch the new copy.
'use strict';

const CACHE = 'brainrush-offline-v2'; // v2: Mokh Rush name and logo (D-64)
const CACHE_PREFIX = 'brainrush-offline-';
const JOIN_CACHE = 'brainrush-join-v1'; // US-52: the last join page and its scripts and styles
const OFFLINE_URL = new URL('offline.html', self.registration.scope).href;
const JOIN_URL = new URL('join.html', self.registration.scope).href;
const API_URL = new URL('api/', self.registration.scope).href;
const HASHED_ASSET = /\.[0-9a-f]{8}(\.(?:js|css))$/; // "join.1a2b3c4d.js" -> base "join.js"

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

function withoutQuery(url) {
  return url.split(/[?#]/)[0];
}

/** join.html, with or without its ?room= code. */
function isJoinPage(url) {
  return withoutQuery(url) === JOIN_URL;
}

/** A script or style loaded by the join page (same site, never api/). */
function isJoinAsset(request) {
  return request.method === 'GET' && (request.destination === 'script' || request.destination === 'style') &&
    request.url.startsWith(self.registration.scope) && !request.url.startsWith(API_URL) &&
    isJoinPage(request.referrer || '');
}

/** Keep the latest copy of a join page file; older hashed copies of the same file are deleted. */
function keepJoinAsset(request, response) {
  const base = withoutQuery(request.url).replace(HASHED_ASSET, '$1');
  return caches.open(JOIN_CACHE).then((cache) => cache.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.url !== request.url && withoutQuery(key.url).replace(HASHED_ASSET, '$1') === base)
      .map((key) => cache.delete(key))))
    .then(() => cache.put(request, response)));
}

/** Network first; a good answer is kept in JOIN_CACHE under `key`, a failure answers from there. */
function joinNetworkFirst(event, key, keep) {
  return fetch(event.request)
    .then((response) => {
      if (response.ok) event.waitUntil(keep(response.clone()));
      return response;
    })
    .catch(() => caches.open(JOIN_CACHE).then((cache) => cache.match(key)));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.url.startsWith(API_URL)) return; // api/rooms.php and every other API call: never cached
  if (isJoinAsset(request)) {
    event.respondWith(joinNetworkFirst(event, request, (response) => keepJoinAsset(request, response))
      .then((response) => response || Response.error()));
    return;
  }
  if (request.mode !== 'navigate' || request.method !== 'GET') return;
  if (isJoinPage(request.url)) {
    event.respondWith(joinNetworkFirst(event, JOIN_URL,
      (response) => caches.open(JOIN_CACHE).then((cache) => cache.put(JOIN_URL, response)))
      .then((response) => response || caches.open(CACHE).then((cache) => cache.match(OFFLINE_URL)))
      .then((page) => page || Response.error()));
    return;
  }
  event.respondWith(
    fetch(request).catch(() => caches.open(CACHE)
      .then((cache) => cache.match(OFFLINE_URL))
      .then((page) => page || Response.error()))
  );
});
