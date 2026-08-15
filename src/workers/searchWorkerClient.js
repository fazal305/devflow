let worker = null
let requestId = 0
const pending = new Map()

function createWorker() {
  const w = new Worker(new URL('./search.worker.js', import.meta.url), { type: 'module' })

  w.onmessage = (event) => {
    const { id, results, indexed, error } = event.data
    const request = pending.get(id)
    if (!request) return
    pending.delete(id)
    if (error) request.reject(new Error(error))
    else request.resolve(results ?? { indexed })
  }

  w.onerror = () => {
    for (const request of pending.values()) request.reject(new Error('Search worker crashed.'))
    pending.clear()
    worker = null
  }

  return w
}

function send(message, { timeoutMs = 5000 } = {}) {
  if (!worker) worker = createWorker()
  const id = ++requestId
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending.delete(id)
      reject(new Error('Search request timed out.'))
    }, timeoutMs)

    pending.set(id, {
      resolve: (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      reject: (err) => {
        clearTimeout(timer)
        reject(err)
      },
    })

    worker.postMessage({ id, ...message })
  })
}

export function indexDocuments(docs) {
  return send({ kind: 'index', docs })
}

export function queryIndex(query, limit = 8) {
  return send({ kind: 'query', query, limit })
}

export function isSearchWorkerSupported() {
  return typeof Worker !== 'undefined'
}

/** True once a worker instance has actually been spun up (lazy — only happens on first index/query). */
export function isSearchWorkerActive() {
  return worker !== null
}
