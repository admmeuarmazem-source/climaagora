const CACHE_NAME = 'climaagora-cache-v2';

// Pre-cache core shell pages
const PRECACHE_URLS = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Completely bypass service worker caching in development to avoid stale asset issues during hot-reloads and coding sessions
  const isDev = self.location.hostname === 'localhost' || 
                self.location.hostname.includes('127.0.0.1') || 
                self.location.hostname.includes('ais-dev') || 
                self.location.hostname.includes('gitpod') || 
                self.location.hostname.includes('codesandbox') || 
                self.location.hostname.includes('webcontainer');
                
  if (isDev) {
    return; // Let the browser handle requests directly from the network
  }

  const url = new URL(event.request.url);

  // 1. Intercept Weather API POST requests
  if (url.pathname === '/api/weather' && event.request.method === 'POST') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If response is valid, clone it and cache it under a fake GET Request key
          if (response.status === 200) {
            const cacheResponse = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(new Request('/api/weather-last'), cacheResponse);
            });
          }
          return response;
        })
        .catch(() => {
          // If offline, serve the last cached weather response
          return caches.match('/api/weather-last').then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Fallback object if no cache exists yet
            return new Response(JSON.stringify({
              city: "Modo Offline",
              state: "Sem Conexão",
              temp: 20,
              max: 25,
              min: 15,
              condition: "Cloudy",
              humidity: 60,
              windSpeed: 12,
              pressure: 1013,
              uvIndex: 3,
              aiSummary: "Sem conexão com a internet. Exibindo dados locais offline temporários.",
              hourly: Array.from({ length: 6 }).map((_, idx) => ({
                time: `${(new Date().getHours() + idx) % 24}:00`,
                temp: 20,
                condition: "Cloudy",
                pop: 10
              })),
              daily: Array.from({ length: 7 }).map((_, idx) => {
                const date = new Date();
                date.setDate(date.getDate() + idx);
                return {
                  day: date.toLocaleDateString('pt-BR', { weekday: 'long' }),
                  date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                  temp: 20,
                  max: 24,
                  min: 16,
                  condition: "Cloudy",
                  pop: 15
                };
              }),
              cie: {
                consensus: 50,
                justification: "Navegador sem rede de dados no momento. Mostrando leituras offline.",
                sources: ["Cache Local do Navegador"]
              },
              decisionCenter: {
                agriculture: { status: 'warning', recommendation: "Sem sinal de internet. Evite aplicar defensivos sem previsão confiável.", confidence: 50 },
                alerts: { status: 'normal', recommendation: "Nenhum alerta recente pôde ser carregado.", confidence: 50 },
                livestock: { status: 'normal', recommendation: "Mantenha o pastoreio padrão.", confidence: 50 },
                solar: { status: 'normal', recommendation: "Sua produção pode variar sem aviso prévio.", confidence: 50 },
                fishing: { status: 'normal', recommendation: "Consulte as condições físicas marítimas locais antes de navegar.", confidence: 50 },
                navigation: { status: 'normal', recommendation: "Navegue com cautela redobrada.", confidence: 50 }
              }
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle standard GET requests for static assets
  if (event.request.method !== 'GET') {
    return;
  }

  // 2. Stale-While-Revalidate Strategy for static assets and page routing
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Silent catch for network request failures (e.g. offline)
        });

      return cachedResponse || fetchPromise;
    })
  );
});
