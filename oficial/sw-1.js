const CACHE_NAME = 'agendamento-v3';
const ASSETS = [
  './',
  './CETI_DARIANA_AGENDAMENTO.html',
  './manifest.json'
];

// Instala e faz cache dos arquivos
self.addEventListener('install', function(event) {
  self.skipWaiting(); // força ativação imediata
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

// Ativa e remove caches antigos
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) {
          return key !== CACHE_NAME;
        }).map(function(key) {
          return caches.delete(key);
        })
      );
    }).then(function() {
      return self.clients.claim(); // assume controle imediato
    })
  );
});

// Busca sempre a versão mais recente da rede, com fallback no cache
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Atualiza o cache com a versão nova
        var responseClone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(function() {
        // Sem internet, usa o cache
        return caches.match(event.request);
      })
  );
});
