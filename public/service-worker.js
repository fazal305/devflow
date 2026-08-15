// Hand-written Service Worker — no build plugin, so it works the same in
// dev and production. Runtime-caches same-origin GET requests and serves
// a cached app shell for navigations when offline.

const CACHE_VERSION = 'devflow-v1'
const APP_SHELL_URLS = ['/', '/index.html']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})

function isDevInternal(pathname) {
  // Never cache Vite's dev-only module graph — caching it would serve stale
  // code during local development. Production builds don't have these paths.
  return (
    pathname.startsWith('/@vite') ||
    pathname.startsWith('/@react-refresh') ||
    pathname.startsWith('/src/') ||
    pathname.includes('/node_modules/')
  )
}

async function networkFirstNavigate(request) {
  try {
    const response = await fetch(request)
    const cache = await caches.open(CACHE_VERSION)
    cache.put('/', response.clone())
    return response
  } catch {
    const cache = await caches.open(CACHE_VERSION)
    const cached = await cache.match('/')
    return cached ?? Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_VERSION)
  const cached = await cache.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) cache.put(request, response.clone())
    return response
  } catch (error) {
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (isDevInternal(url.pathname)) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigate(request))
    return
  }

  event.respondWith(cacheFirst(request))
})
