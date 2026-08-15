import { createStore, STORES } from './database'
import { generateId } from '../utils/id'

const store = createStore(STORES.snippets)

export async function getAllSnippets() {
  return store.getAll()
}

export async function getSnippetsByProject(projectId) {
  return store.getAllByIndex('projectId', projectId)
}

export async function getSnippetsByLanguage(language) {
  return store.getAllByIndex('language', language)
}

export async function getSnippet(id) {
  return store.get(id)
}

/** Builds a snippet record without touching storage — used for optimistic UI updates. */
export function buildSnippet({
  title,
  language = 'javascript',
  description = '',
  code = '',
  tags = [],
  projectId = null,
}) {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title,
    language,
    description,
    code,
    tags,
    projectId,
    createdAt: now,
    updatedAt: now,
  }
}

export async function saveSnippet(snippet) {
  await store.put(snippet)
  return snippet
}

export async function createSnippet(data) {
  return saveSnippet(buildSnippet(data))
}

export async function updateSnippet(id, patch) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Snippet ${id} not found.`)
  const updated = { ...existing, ...patch, id, updatedAt: new Date().toISOString() }
  await store.put(updated)
  return updated
}

export async function duplicateSnippet(id) {
  const existing = await store.get(id)
  if (!existing) throw new Error(`Snippet ${id} not found.`)
  return createSnippet({
    title: `${existing.title} (copy)`,
    language: existing.language,
    description: existing.description,
    code: existing.code,
    tags: existing.tags,
    projectId: existing.projectId,
  })
}

export async function deleteSnippet(id) {
  return store.remove(id)
}

export async function countSnippets() {
  return store.count()
}
