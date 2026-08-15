import { useEffect, useState } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { indexDocuments, queryIndex } from '../workers/searchWorkerClient'
import { truncate } from '../utils/formatting'

const REINDEX_DELAY_MS = 250

function buildDocs(state) {
  const docs = []

  for (const p of state.projects.items) {
    docs.push({
      id: p.id,
      type: 'project',
      title: p.name,
      subtitle: p.description,
      tags: p.tags,
      updatedAt: p.updatedAt,
    })
  }
  for (const n of state.notes.items) {
    docs.push({
      id: n.id,
      type: 'note',
      title: n.title || 'Untitled note',
      subtitle: truncate(n.content, 200),
      tags: n.tags,
      updatedAt: n.updatedAt,
    })
  }
  for (const t of state.tasks.items) {
    docs.push({
      id: t.id,
      type: 'task',
      title: t.title,
      subtitle: t.description,
      tags: t.labels,
      updatedAt: t.updatedAt,
    })
  }
  for (const s of state.snippets.items) {
    docs.push({
      id: s.id,
      type: 'snippet',
      title: s.title,
      subtitle: s.description,
      tags: s.tags,
      updatedAt: s.updatedAt,
    })
  }

  return docs
}

/** Keeps the Search Worker's index in sync with workspace state and exposes a query function. */
export function useGlobalSearch() {
  const { state } = useWorkspace()
  const [indexStatus, setIndexStatus] = useState('building') // building | ready | error

  useEffect(() => {
    const docs = buildDocs(state)
    const timer = setTimeout(() => {
      indexDocuments(docs)
        .then(() => setIndexStatus('ready'))
        .catch(() => setIndexStatus('error'))
    }, REINDEX_DELAY_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.projects.items, state.notes.items, state.tasks.items, state.snippets.items])

  const search = async (query, limit = 30) => {
    if (!query.trim()) return {}
    const results = await queryIndex(query, limit)
    const grouped = {}
    for (const doc of results) {
      if (!grouped[doc.type]) grouped[doc.type] = []
      grouped[doc.type].push(doc)
    }
    return grouped
  }

  return { search, indexStatus }
}
