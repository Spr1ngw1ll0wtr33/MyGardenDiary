/* My Garden Diary — offline working.
   Keeps a copy of every file the app needs on the phone, so it opens and works with no
   internet at all. It never touches the diary's entries or photographs, and never sends
   anything anywhere; it only fetches the app's own files from its own address.

   VERSION and FILES are filled in by tools/stamp-offline.py whenever the app changes, so the
   phone knows to fetch the new copy. */

/* 30/09/2026: this note was added only to prompt phones to fetch a fresh offline copy, after
   another app on the same web address (Boundaries, since fixed) cleared it by mistake. */

const VERSION = 'dde7bdbf48a2';
const FILES = [
  './',
  'index.html',
  'manifest.json',
  'seasons.css',
  'app.css',
  'vendor/docx.iife.js',
  'storage.js',
  'backup.js',
  'monthend.js',
  'app.js',
  'assets/icon.svg',
  'assets/frame.png',
  'assets/fonts/BoecklinsUniverse.ttf',
  'assets/fonts/EBGaramond-Bold.ttf',
  'assets/fonts/GlassAntiqua-Regular.ttf',
  'assets/motifs/autumn.svg',
  'assets/motifs/divider.svg',
  'assets/motifs/spring.svg',
  'assets/motifs/summer.svg',
  'assets/motifs/winter.svg',
  'assets/doc/divider.png',
  'assets/doc/frame-landscape.png',
  'assets/doc/frame-portrait.png',
  'assets/doc/motif-autumn.png',
  'assets/doc/motif-spring.png',
  'assets/doc/motif-summer.png',
  'assets/doc/motif-winter.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-192.png',
  'icons/icon-maskable-512.png'
];

const CACHE = 'my-garden-diary-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 'reload' skips any stale copy the browser may be holding, so the set is all one version
    await cache.addAll(FILES.map(f => new Request(f, { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith('my-garden-diary-') && key !== CACHE) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(event.request, { ignoreSearch: true });
    if (hit) return hit;
    if (event.request.mode === 'navigate') {
      const page = await cache.match('./');
      if (page) return page;
    }
    return fetch(event.request);
  })());
});
