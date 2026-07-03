const CACHE_NAME = 'prime-etiquetas-v3';
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
  const url = new URL(e.request.url);

  // 1) A programação do dia NUNCA é cacheada: sempre rede (não servir versão velha).
  if (e.request.url.includes('programacao-hoje')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // 2) index.html / navegação: REDE PRIMEIRO (app sempre atualizado),
  //    cache só como reserva quando estiver offline.
  if (e.request.mode === 'navigate' ||
      url.pathname.endsWith('/index.html') ||
      url.pathname.endsWith('/Etiquetas-Prime/')) {
    e.respondWith(
      fetch(e.request)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put('/Etiquetas-Prime/index.html', copy));
          return resp;
        })
        .catch(() => caches.match('/Etiquetas-Prime/index.html'))
    );
    return;
  }

  // 3) Demais arquivos (bibliotecas, ícones, manifest): cache primeiro.
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
