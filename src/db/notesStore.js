import { createStore, STORES } from './database'
import { generateId } from '../utils/id'

const store = createStore(STORES.notes)

export async function getAllNotes() {
  return store.getAll()
}

export async function getNotesByProject(projectId) {
  return store.getAllByIndex('projectId', projectId)
}

export async function getNote(id) {
  return store.get(id)
}

/** Builds a note record without touching storage — used for optimistic UI updates. */
export function buildNote({ title = 'Untitled note', content = '', projectId = null, tags = [] }) {
  const now = new Date().toISOString()
  return { id: generateId(), title, content, projectId, tags, createdAt: now, updatedAt: now }
}

export async function saveNote(note) {
  await store.put(note)
  return note
}

export async function createNote(data) {
  return saveNote(buildNote(data))
}

export async function updateNote(id, patch) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Note ${id} not found.`)
  const updated = { ...existing, ...patch, id, updatedAt: new Date().toISOString() }
  await store.put(updated)
  return updated
}

export async function duplicateNote(id) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Note ${id} not found.`)
  return createNote({
    title: `${existing.title} (copy)`,
    content: existing.content,
    projectId: existing.projectId,
    tags: existing.tags,
  })
}

export async function deleteNote(id) {
  return store.remove(id)
}

export async function countNotes() {
  return store.count()
}
