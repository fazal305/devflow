import { createStore, STORES } from './database'
import { generateId } from '../utils/id'

const store = createStore(STORES.projects)

export async function getAllProjects() {
  return store.getAll()
}

export async function getProject(id) {
  return store.get(id)
}

/** Builds a project record without touching storage — used for optimistic UI updates. */
export function buildProject({ name, description = '', tags = [], status = 'active' }) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    name,
    description,
    tags,
    status,
    archived: false,
    createdAt: now,
    updatedAt: now,
  }
}

export async function saveProject(project) {
  await store.put(project)
  return project
}

export async function createProject(data) {
  return saveProject(buildProject(data))
}

export async function updateProject(id, patch) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Project ${id} not found.`)
  const updated = { ...existing, ...patch, id, updatedAt: new Date().toISOString() }
  await store.put(updated)
  return updated
}

export async function setProjectArchived(id, archived) {
  return updateProject(id, { archived })
}

export async function deleteProject(id) {
  return store.remove(id)
}

export async function countProjects() {
  return store.count()
}
