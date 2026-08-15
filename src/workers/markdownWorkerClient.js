import { marked } from 'marked'

const WORKER_SUPPORTED = typeof Worker !== 'undefined'

let worker = null
let requestId = 0
const pending = new Map()

function createWorker() {
  const w = new Worker(new URL('./markdown.worker.js', import.meta.url), { type: 'module' })

  w.onmessage = (event) => {
    const { id, html, error } = event.data
    const request = pending.get(id)
    if (!request) return
    pending.delete(id)
    if (error) request.reject(new Error(error))
    else request.resolve(html)
  }

  w.onerror = () => {
    for (const request of pending.values()) {
      request.reject(new Error('Markdown worker crashed.'))
    }
    pending.clear()
    worker = null
  }

  return w
}

/** Parses Markdown off the main thread. Falls back to synchronous parsing if Workers are unsupported. */
export function parseMarkdown(markdown, { timeoutMs = 5000 } = {}) {
  if (!WORKER_SUPPORTED) {
    try {
      return Promise.resolve(marked.parse(markdown ?? ''))
    } catch (error) {
      return Promise.reject(error)
    }
  }

  if (!worker) worker = createWorker()

  const id = ++requestId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Markdown parsing timed out.'))
    }, timeoutMs)

    pending.set(id, {
      resolve: (html) => {
        clearTimeout(timer)
        resolve(html)
      },
      reject: (err) => {
        clearTimeout(timer)
        reject(err)
      },
    })

    worker.postMessage({ id, markdown })
  })
}

export function isMarkdownWorkerSupported() {
  return WORKER_SUPPORTED
}

/** True once a worker instance has actually been spun up (lazy — only happens on first parse). */
export function isMarkdownWorkerActive() {
  return worker !== null
}
