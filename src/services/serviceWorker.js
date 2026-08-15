export function isServiceWorkerSupported() {
  return 'serviceWorker' in navigator
}

/** Registers the Service Worker and reports when an updated version is waiting to activate. */
export function registerServiceWorker({ onUpdate } = {}) {
  if (!isServiceWorkerSupported()) return Promise.resolve(null)

  return navigator.serviceWorker.register('/service-worker.js').then((registration) => {
    registration.addEventListener('updatefound', () => {
      const installing = registration.installing
      if (!installing) return
      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && navigator.serviceWorker.controller) {
          onUpdate?.(registration)
        }
      })
    })
    return registration
  })
}

/** Tells the waiting worker to take over, then reloads once it does. */
export function activateWaitingWorker(registration) {
  if (!registration?.waiting) return
  registration.waiting.postMessage({ type: 'SKIP_WAITING' })
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), { once: true })
}
