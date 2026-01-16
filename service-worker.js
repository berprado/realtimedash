/**
 * Service Worker para BackDash PWA
 * Estrategia: Cache First para assets, Network First para HTML y datos
 */

const CACHE_VERSION = 'backdash-v1.1.0';
const CACHE_STATIC = `${CACHE_VERSION}-static`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-dynamic`;

// Assets estáticos que se cachearán en la instalación
const STATIC_ASSETS = [
  '/mysql-realtime-fetching/',
  '/mysql-realtime-fetching/index.html',
  '/mysql-realtime-fetching/offline.html',
  '/mysql-realtime-fetching/css/main.css',
  '/mysql-realtime-fetching/css/layout.css',
  '/mysql-realtime-fetching/css/modules/summary.css',
  '/mysql-realtime-fetching/css/modules/kpi.css',
  '/mysql-realtime-fetching/css/modules/analytics.css',
  '/mysql-realtime-fetching/assets/favicon/android-icon-192x192.png',
  '/mysql-realtime-fetching/assets/favicon/android-icon-512x512.png',
  '/mysql-realtime-fetching/assets/favicon/favicon-32x32.png'
];

// Patrones de URLs que NO deben cachearse
const NEVER_CACHE = [
  /\/api\//,
  /\/socket/,
  /websocket/,
  /\.php$/
];

/**
 * Instalación - Cachea recursos estáticos
 */
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalando...');

  event.waitUntil(
    caches.open(CACHE_STATIC)
      .then((cache) => {
        console.log('[Service Worker] Cacheando assets estáticos');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Instalación completada');
        // Forzar activación inmediata
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Error en instalación:', error);
      })
  );
});

/**
 * Activación - Limpia caches antiguos
 */
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activando...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Eliminar caches de versiones anteriores
            if (cacheName.startsWith('backdash-') &&
              cacheName !== CACHE_STATIC &&
              cacheName !== CACHE_DYNAMIC) {
              console.log('[Service Worker] Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activado y controlando todas las páginas');
        // Tomar control inmediato de todas las páginas
        return self.clients.claim();
      })
  );
});

/**
 * Fetch - Intercepta peticiones y aplica estrategias de cache
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no deben cachearse
  if (shouldNeverCache(url)) {
    return; // Dejar que pase directo a la red
  }

  // Ignorar peticiones que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Aplicar estrategia según tipo de recurso
  if (isStaticAsset(url)) {
    // Cache First para assets estáticos (CSS, JS, imágenes)
    event.respondWith(cacheFirst(request));
  } else if (isHTMLPage(request)) {
    // Network First para páginas HTML
    event.respondWith(networkFirst(request));
  } else {
    // Por defecto: intenta red primero, fallback a cache
    event.respondWith(networkFirst(request));
  }
});

/**
 * Estrategia: Cache First
 * Busca en cache primero, si no está disponible descarga de red
 */
async function cacheFirst(request) {
  try {
    // Buscar en cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no está en cache, descargar de red
    const networkResponse = await fetch(request);

    // Cachear la respuesta si es exitosa
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[Service Worker] Error en cacheFirst:', error);

    // Fallback: intentar buscar en cache dinámico
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si nada funciona y es una navegación, mostrar página offline
    if (request.destination === 'document') {
      return caches.match('/mysql-realtime-fetching/offline.html');
    }

    throw error;
  }
}

/**
 * Estrategia: Network First
 * Intenta red primero, fallback a cache si falla
 */
async function networkFirst(request) {
  try {
    // Intentar red primero con timeout
    const networkResponse = await fetchWithTimeout(request, 5000);

    // Cachear respuesta exitosa en cache dinámico
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(CACHE_DYNAMIC);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Red no disponible, usando cache');

    // Fallback a cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Si es navegación y no hay cache, mostrar página offline
    if (request.destination === 'document') {
      return caches.match('/mysql-realtime-fetching/offline.html');
    }

    throw error;
  }
}

/**
 * Fetch con timeout
 */
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

/**
 * Verifica si la URL nunca debe cachearse
 */
function shouldNeverCache(url) {
  return NEVER_CACHE.some(pattern => pattern.test(url.pathname));
}

/**
 * Verifica si es un asset estático
 */
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

/**
 * Verifica si es una página HTML
 */
function isHTMLPage(request) {
  return request.destination === 'document' ||
    request.headers.get('Accept')?.includes('text/html');
}

/**
 * Listener para mensajes del cliente (para skip waiting, etc.)
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[Service Worker] Skip waiting solicitado');
    self.skipWaiting();
  }
});
