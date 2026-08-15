import { createStore, STORES } from './database'
import { generateId } from '../utils/id'

const store = createStore(STORES.activity)

export async function getAllActivity() {
  return store.getAll()
}

export async function logActivity({ action, entityType, entityId = null, metadata = {} }) {
  const entry = {
    id: generateId(),
    action,
    entityType,
    entityId,
    metadata,
    timestamp: new Date().toISOString(),
  }
  await store.put(entry)
  return entry
}

export async function getRecentActivity(limit = 20) {
  const all = await store.getAll()
  return all.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit)
}

export async function countActivity() {
  return store.count()
}
