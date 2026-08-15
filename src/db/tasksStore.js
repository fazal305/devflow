import { createStore, STORES } from './database'
import { generateId } from '../utils/id'

const store = createStore(STORES.tasks)

export async function getAllTasks() {
  return store.getAll()
}

export async function getTasksByProject(projectId) {
  return store.getAllByIndex('projectId', projectId)
}

export async function getTasksByStatus(status) {
  return store.getAllByIndex('status', status)
}

export async function getTask(id) {
  return store.get(id)
}

/** Builds a task record without touching storage — used for optimistic UI updates. */
export function buildTask({
  title,
  description = '',
  status = 'backlog',
  priority = 'medium',
  labels = [],
  projectId = null,
  dueDate = null,
  order = Date.now(),
}) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title,
    description,
    status,
    priority,
    labels,
    projectId,
    dueDate,
    order,
    createdAt: now,
    updatedAt: now,
  }
}

export async function saveTask(task) {
  await store.put(task)
  return task
}

export async function createTask(data) {
  return saveTask(buildTask(data))
}

export async function updateTask(id, patch) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Task ${id} not found.`)
  const updated = { ...existing, ...patch, id, updatedAt: new Date().toISOString() }
  await store.put(updated)
  return updated
}

/** Persists new order/status values for a batch of reordered tasks in one transaction. */
export async function reorderTasks(tasks) {
  await store.bulkPut(tasks)
  return tasks
}

export async function deleteTask(id) {
  return store.remove(id)
}

export async function countTasks() {
  return store.count()
}
