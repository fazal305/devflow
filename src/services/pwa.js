// Registered at module load (imported early from main.jsx) so we don't miss
// a `beforeinstallprompt` event that fires before React has mounted.
let deferredPrompt = null
const listeners = new Set()

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault()
  deferredPrompt = event
  listeners.forEach((cb) => cb(true))
})

window.addEventListener('appinstalled', () => {
  deferredPrompt = null
  listeners.forEach((cb) => cb(false))
})

export function isInstallAvailable() {
  return deferredPrompt !== null
}

export function subscribeInstallAvailability(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

export async function promptInstall() {
  if (!deferredPrompt) return null
  deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  return choice
}

export function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}
