const CACHE_NAME = 'prime-etiquetas-v2';
const ASSETS = [
  '/Etiquetas-Prime/',
  '/Etiquetas-Prime/index.html',
  '/Etiquetas-Prime/manifest.json',
  '/Etiquetas-Prime/icon-192.png',
  '/Etiquetas-Prime/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // A programação do dia nunca é cacheada: sempre busca na rede para não servir versão velha.
  if (e.request.url.includes('programacao-hoje')) {
    e.respondWith(fetch(e.request));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
