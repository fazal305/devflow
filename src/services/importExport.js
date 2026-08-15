import { createStore, STORES } from '../db/database'
import { TASK_STATUSES } from '../config/taskOptions'
import { generateId } from '../utils/id'
import { saveTextFile } from './fileSystem'

export const EXPORT_VERSION = 1

const ENTITY_KEYS = ['projects', 'notes', 'tasks', 'snippets', 'activity']

async function getAllFrom(storeName) {
  return createStore(storeName).getAll()
}

/** Gathers the entire workspace into one JSON-serializable object. */
export async function buildWorkspaceExport() {
  const [projects, notes, tasks, snippets, activity] = await Promise.all([
    getAllFrom(STORES.projects),
    getAllFrom(STORES.notes),
    getAllFrom(STORES.tasks),
    getAllFrom(STORES.snippets),
    getAllFrom(STORES.activity),
  ])

  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    projects,
    notes,
    tasks,
    snippets,
    activity,
  }
}

/** Triggers a browser download of the given data as a named JSON file. */
export function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports the workspace, preferring the File System Access "Save As" picker
 * (lets the user choose exactly where the file goes) and falling back to a
 * plain browser download when the API is unsupported, denied, or cancelled.
 */
export async function exportWorkspace() {
  const data = await buildWorkspaceExport()
  const stamp = data.exportedAt.slice(0, 10)
  const filename = `devflow-workspace-${stamp}.json`
  const content = JSON.stringify(data, null, 2)

  const outcome = await saveTextFile(content, {
    suggestedName: filename,
    mimeType: 'application/json',
    extension: '.json',
    fallback: () => downloadJSON(data, filename),
  })

  return { data, outcome }
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== ''
const isString = (v) => typeof v === 'string'

const ITEM_VALIDATORS = {
  projects: (item) => isNonEmptyString(item.id) && isNonEmptyString(item.name),
  notes: (item) => isNonEmptyString(item.id) && isString(item.title),
  tasks: (item) =>
    isNonEmptyString(item.id) &&
    isNonEmptyString(item.title) &&
    TASK_STATUSES.some((s) => s.value === item.status),
  snippets: (item) => isNonEmptyString(item.id) && isNonEmptyString(item.title),
  activity: (item) => isNonEmptyString(item.id) && isNonEmptyString(item.action),
}

/**
 * Validates a parsed import file. Never throws — always returns a report so
 * the UI can show a preview or a clear error instead of a stack trace.
 */
export function validateWorkspaceImport(data) {
  const errors = []

  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return { valid: false, errors: ['File is not a valid workspace export (expected a JSON object).'], counts: null, cleaned: null }
  }

  const cleaned = {}
  const counts = {}
  let totalValid = 0

  for (const key of ENTITY_KEYS) {
    const raw = data[key]
    if (raw === undefined) {
      cleaned[key] = []
      counts[key] = { valid: 0, invalid: 0 }
      continue
    }
    if (!Array.isArray(raw)) {
      errors.push(`"${key}" should be a list but wasn't — that section will be skipped.`)
      cleaned[key] = []
      counts[key] = { valid: 0, invalid: 0 }
      continue
    }

    const validator = ITEM_VALIDATORS[key]
    const validItems = []
    let invalid = 0
    for (const item of raw) {
      if (item && typeof item === 'object' && validator(item)) {
        validItems.push(item)
      } else {
        invalid += 1
      }
    }
    cleaned[key] = validItems
    counts[key] = { valid: validItems.length, invalid }
    totalValid += validItems.length
    if (invalid > 0) {
      errors.push(`${invalid} ${key} record${invalid === 1 ? '' : 's'} skipped (missing required fields).`)
    }
  }

  if (totalValid === 0) {
    return { valid: false, errors: [...errors, 'No importable records found in this file.'], counts, cleaned: null }
  }

  return { valid: true, errors, counts, cleaned }
}

/** Parses and validates a File without writing anything — safe to call before showing a preview. */
export async function readWorkspaceFile(file) {
  const text = await file.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    return { valid: false, errors: ['This file is not valid JSON.'], counts: null, cleaned: null }
  }
  return validateWorkspaceImport(data)
}

const STORE_BY_KEY = {
  projects: STORES.projects,
  notes: STORES.notes,
  tasks: STORES.tasks,
  snippets: STORES.snippets,
  activity: STORES.activity,
}

/**
 * Writes validated records into IndexedDB. Existing records with matching
 * ids are overwritten (upsert); everything else is added alongside what's
 * already there — import never deletes existing data.
 */
export async function importWorkspace(cleaned) {
  for (const key of ENTITY_KEYS) {
    const records = cleaned[key]
    if (records.length > 0) {
      await createStore(STORE_BY_KEY[key]).bulkPut(records)
    }
  }

  await createStore(STORES.activity).put({
    id: generateId(),
    action: 'Imported workspace',
    entityType: 'workspace',
    entityId: null,
    metadata: {
      projects: cleaned.projects.length,
      notes: cleaned.notes.length,
      tasks: cleaned.tasks.length,
      snippets: cleaned.snippets.length,
    },
    timestamp: new Date().toISOString(),
  })
}
