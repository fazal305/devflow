import { useCallback, useMemo } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import * as notesStore from '../db/notesStore'
import { useLogActivity } from './useLogActivity'

export function useNotes() {
  const { state, dispatch } = useWorkspace()
  const { items: notes, status, error } = state.notes
  const logActivity = useLogActivity()

  const createNote = useCallback(
    async (data) => {
      const note = notesStore.buildNote(data)
      dispatch({ type: 'NOTE_ADDED', payload: note })
      try {
        await notesStore.saveNote(note)
        await logActivity({
          action: 'Created note',
          entityType: 'note',
          entityId: note.id,
          metadata: { title: note.title },
        })
        return note
      } catch (err) {
        dispatch({ type: 'NOTE_REMOVED', payload: note.id })
        throw err
      }
    },
    [dispatch, logActivity],
  )

  const updateNote = useCallback(
    async (id, patch, { silent = false } = {}) => {
      const previous = notes.find((n) => n.id === id)
      if (!previous) throw new Error(`Note ${id} not found.`)
      const optimistic = { ...previous, ...patch, updatedAt: new Date().toISOString() }
      dispatch({ type: 'NOTE_UPDATED', payload: optimistic })
      try {
        const saved = await notesStore.updateNote(id, patch)
        dispatch({ type: 'NOTE_UPDATED', payload: saved })
        if (!silent) {
          await logActivity({
            action: 'Updated note',
            entityType: 'note',
            entityId: id,
            metadata: { title: saved.title },
          })
        }
        return saved
      } catch (err) {
        dispatch({ type: 'NOTE_UPDATED', payload: previous })
        throw err
      }
    },
    [dispatch, notes, logActivity],
  )

  const deleteNote = useCallback(
    async (id) => {
      const previous = notes.find((n) => n.id === id)
      if (!previous) return
      dispatch({ type: 'NOTE_REMOVED', payload: id })
      try {
        await notesStore.deleteNote(id)
        await logActivity({
          action: 'Deleted note',
          entityType: 'note',
          entityId: id,
          metadata: { title: previous.title },
        })
      } catch (err) {
        dispatch({ type: 'NOTE_RESTORED', payload: previous })
        throw err
      }
    },
    [dispatch, notes, logActivity],
  )

  const duplicateNote = useCallback(
    async (id) => {
      const original = notes.find((n) => n.id === id)
      if (!original) throw new Error(`Note ${id} not found.`)
      return createNote({
        title: `${original.title} (copy)`,
        content: original.content,
        projectId: original.projectId,
        tags: original.tags,
      })
    },
    [notes, createNote],
  )

  const getNote = useCallback((id) => notes.find((n) => n.id === id), [notes])
  const getNotesByProject = useCallback(
    (projectId) => notes.filter((n) => n.projectId === projectId),
    [notes],
  )

  const sortedNotes = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes],
  )

  return {
    notes: sortedNotes,
    status,
    error,
    getNote,
    getNotesByProject,
    createNote,
    updateNote,
    deleteNote,
    duplicateNote,
  }
}
