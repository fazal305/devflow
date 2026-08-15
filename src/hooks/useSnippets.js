import { useCallback, useMemo } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import * as snippetsStore from '../db/snippetsStore'
import { useLogActivity } from './useLogActivity'

export function useSnippets() {
  const { state, dispatch } = useWorkspace()
  const { items: snippets, status, error } = state.snippets
  const logActivity = useLogActivity()

  const createSnippet = useCallback(
    async (data) => {
      const snippet = snippetsStore.buildSnippet(data)
      dispatch({ type: 'SNIPPET_ADDED', payload: snippet })
      try {
        await snippetsStore.saveSnippet(snippet)
        await logActivity({
          action: 'Created snippet',
          entityType: 'snippet',
          entityId: snippet.id,
          metadata: { title: snippet.title, language: snippet.language },
        })
        return snippet
      } catch (err) {
        dispatch({ type: 'SNIPPET_REMOVED', payload: snippet.id })
        throw err
      }
    },
    [dispatch, logActivity],
  )

  const updateSnippet = useCallback(
    async (id, patch, { silent = false } = {}) => {
      const previous = snippets.find((s) => s.id === id)
      if (!previous) throw new Error(`Snippet ${id} not found.`)
      const optimistic = { ...previous, ...patch, updatedAt: new Date().toISOString() }
      dispatch({ type: 'SNIPPET_UPDATED', payload: optimistic })
      try {
        const saved = await snippetsStore.updateSnippet(id, patch)
        dispatch({ type: 'SNIPPET_UPDATED', payload: saved })
        if (!silent) {
          await logActivity({
            action: 'Updated snippet',
            entityType: 'snippet',
            entityId: id,
            metadata: { title: saved.title },
          })
        }
        return saved
      } catch (err) {
        dispatch({ type: 'SNIPPET_UPDATED', payload: previous })
        throw err
      }
    },
    [dispatch, snippets, logActivity],
  )

  const deleteSnippet = useCallback(
    async (id) => {
      const previous = snippets.find((s) => s.id === id)
      if (!previous) return
      dispatch({ type: 'SNIPPET_REMOVED', payload: id })
      try {
        await snippetsStore.deleteSnippet(id)
        await logActivity({
          action: 'Deleted snippet',
          entityType: 'snippet',
          entityId: id,
          metadata: { title: previous.title },
        })
      } catch (err) {
        dispatch({ type: 'SNIPPET_RESTORED', payload: previous })
        throw err
      }
    },
    [dispatch, snippets, logActivity],
  )

  const duplicateSnippet = useCallback(
    async (id) => {
      const original = snippets.find((s) => s.id === id)
      if (!original) throw new Error(`Snippet ${id} not found.`)
      return createSnippet({
        title: `${original.title} (copy)`,
        language: original.language,
        description: original.description,
        code: original.code,
        tags: original.tags,
        projectId: original.projectId,
      })
    },
    [snippets, createSnippet],
  )

  const getSnippetsByProject = useCallback(
    (projectId) => snippets.filter((s) => s.projectId === projectId),
    [snippets],
  )

  const sortedSnippets = useMemo(
    () => [...snippets].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [snippets],
  )

  return {
    snippets: sortedSnippets,
    status,
    error,
    getSnippetsByProject,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    duplicateSnippet,
  }
}
