let worker = null
let requestId = 0
const pending = new Map()

function createWorker() {
  const w = new Worker(new URL('./ai.worker.js', import.meta.url), { type: 'module' })

  w.onmessage = (event) => {
    const { id, kind, summary, error, progress } = event.data
    const request = pending.get(id)
    if (!request) return

    if (kind === 'progress') {
      request.onProgress?.(progress)
      return
    }

    pending.delete(id)
    if (kind === 'error') request.reject(new Error(error))
    else request.resolve(summary)
  }

  w.onerror = () => {
    for (const request of pending.values()) request.reject(new Error('AI worker crashed.'))
    pending.clear()
    worker = null
  }

  return w
}

export function isAIWorkerSupported() {
  return typeof Worker !== 'undefined'
}

/** True once the AI worker has actually been spun up (lazy — only on first summarize call). */
export function isAIWorkerActive() {
  return worker !== null
}

/**
 * Summarizes text using a local model running entirely in a Web Worker.
 * The model (~150MB) downloads on first use and is cached by the browser
 * afterward. `onProgress` receives the raw Transformers.js progress events.
 */
export function summarizeText(text, { onProgress, timeoutMs = 120000 } = {}) {
  if (!isAIWorkerSupported()) {
    return Promise.reject(new Error('Web Workers are not supported in this browser.'))
  }

  if (!worker) worker = createWorker()

  const id = ++requestId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Summarization timed out. The model may still be downloading — try again.'))
    }, timeoutMs)

    pending.set(id, {
      onProgress,
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: (err) => {
        clearTimeout(timer)
        reject(err)
      },
    })

    worker.postMessage({ id, kind: 'summarize', text })
  })
}
