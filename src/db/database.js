import { openDB } from 'idb'

export const DB_NAME = 'devflow'
export const DB_VERSION = 1

export const STORES = {
  projects: 'projects',
  notes: 'notes',
  tasks: 'tasks',
  snippets: 'snippets',
  activity: 'activity',
}

/** Thrown for any failure in the data layer — components can catch this specifically. */
export class DBError extends Error {
  constructor(message, { cause, code } = {}) {
    super(message)
    this.name = 'DBError'
    this.code = code ?? cause?.name ?? 'UNKNOWN'
    this.cause = cause
  }
}

export function isIndexedDBSupported() {
  return typeof indexedDB !== 'undefined'
}

let dbPromise = null

function upgrade(db, oldVersion) {
  if (oldVersion < 1) {
    const projects = db.createObjectStore(STORES.projects, { keyPath: 'id' })
    projects.createIndex('status', 'status')
    projects.createIndex('archived', 'archived')
    projects.createIndex('updatedAt', 'updatedAt')

    const notes = db.createObjectStore(STORES.notes, { keyPath: 'id' })
    notes.createIndex('projectId', 'projectId')
    notes.createIndex('updatedAt', 'updatedAt')

    const tasks = db.createObjectStore(STORES.tasks, { keyPath: 'id' })
    tasks.createIndex('projectId', 'projectId')
    tasks.createIndex('status', 'status')
    tasks.createIndex('updatedAt', 'updatedAt')

    const snippets = db.createObjectStore(STORES.snippets, { keyPath: 'id' })
    snippets.createIndex('projectId', 'projectId')
    snippets.createIndex('language', 'language')
    snippets.createIndex('updatedAt', 'updatedAt')

    const activity = db.createObjectStore(STORES.activity, { keyPath: 'id' })
    activity.createIndex('entityType', 'entityType')
    activity.createIndex('timestamp', 'timestamp')
  }
  // Future schema changes: `if (oldVersion < 2) { ... }`, each block additive.
}

/**
 * Returns a shared, lazily-opened database connection. Safe to call
 * repeatedly — every caller awaits the same open operation.
 */
export function getDB() {
  if (!isIndexedDBSupported()) {
    return Promise.reject(new DBError('IndexedDB is not available in this browser.', { code: 'UNSUPPORTED' }))
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade,
      blocked() {
        console.warn('DevFlow database upgrade is blocked by another open tab.')
      },
      blocking() {
        // Another tab is trying to upgrade; release our connection so it can proceed.
        dbPromise?.then((db) => db.close())
        dbPromise = null
      },
      terminated() {
        console.error('DevFlow database connection was unexpectedly terminated.')
        dbPromise = null
      },
    }).catch((cause) => {
      dbPromise = null
      throw new DBError('Failed to open the local database.', { cause })
    })
  }

  return dbPromise
}

function wrapError(cause, fallbackMessage) {
  if (cause instanceof DBError) return cause
  if (cause?.name === 'QuotaExceededError') {
    return new DBError('Local storage is full. Free up space or export and prune old data.', {
      cause,
      code: 'QUOTA_EXCEEDED',
    })
  }
  return new DBError(fallbackMessage, { cause })
}

/**
 * Builds a small, consistent CRUD surface over one object store so
 * components and hooks never touch raw IndexedDB transactions.
 */
export function createStore(storeName) {
  async function withStore(mode, fn, fallbackMessage) {
    try {
      const db = await getDB()
      const tx = db.transaction(storeName, mode)
      const result = await fn(tx.store)
      await tx.done
      return result
    } catch (cause) {
      throw wrapError(cause, fallbackMessage)
    }
  }

  return {
    async getAll() {
      return withStore('readonly', (store) => store.getAll(), `Failed to read ${storeName}.`)
    },

    async getAllByIndex(indexName, query) {
      return withStore(
        'readonly',
        (store) => store.index(indexName).getAll(query),
        `Failed to query ${storeName} by ${indexName}.`,
      )
    },

    async get(id) {
      return withStore('readonly', (store) => store.get(id), `Failed to read record from ${storeName}.`)
    },

    async count() {
      return withStore('readonly', (store) => store.count(), `Failed to count ${storeName}.`)
    },

    async put(record) {
      return withStore('readwrite', (store) => store.put(record), `Failed to save to ${storeName}.`)
    },

    async bulkPut(records) {
      return withStore(
        'readwrite',
        async (store) => {
          await Promise.all(records.map((record) => store.put(record)))
        },
        `Failed to bulk-save to ${storeName}.`,
      )
    },

    async remove(id) {
      return withStore('readwrite', (store) => store.delete(id), `Failed to delete from ${storeName}.`)
    },

    async clear() {
      return withStore('readwrite', (store) => store.clear(), `Failed to clear ${storeName}.`)
    },
  }
}
