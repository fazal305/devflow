import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { Icon } from '../components/common/Icon'
import { NoteList } from '../components/notes/NoteList'
import { NoteEditorPane } from '../components/notes/NoteEditorPane'
import { useNotes } from '../hooks/useNotes'
import { useMediaQuery } from '../hooks/useMediaQuery'
import { useOpenCreateSignal } from '../hooks/useOpenCreateSignal'
import './Notes.css'

export default function Notes() {
  const { notes, status, createNote } = useNotes()
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(searchParams.get('note'))
  const isMobile = useMediaQuery('(max-width: 767px)')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return notes
    return notes.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [notes, query])

  const handleCreate = async () => {
    const note = await createNote({ title: 'Untitled note', content: '' })
    setSelectedId(note.id)
  }

  useOpenCreateSignal(handleCreate)

  useEffect(() => {
    if (status !== 'ready') return
    if (selectedId && notes.some((n) => n.id === selectedId)) return
    setSelectedId(notes[0]?.id ?? null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, notes])

  useEffect(() => {
    if (searchParams.get('note')) setSearchParams({}, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedNote = notes.find((n) => n.id === selectedId)

  const showList = !isMobile || !selectedNote

  return (
    <div className="notes-page">
      <PageHeader
        title="Notes"
        description="Markdown notes with live preview and autosave."
        actions={
          <button className="notes-page__new" onClick={handleCreate}>
            <Icon name="plus" size={16} />
            New Note
          </button>
        }
      />

      {status === 'loading' && <LoadingIndicator label="Loading notes…" />}

      {status === 'ready' && notes.length === 0 && (
        <EmptyState
          icon={<Icon name="notes" size={28} />}
          title="No notes yet"
          description="Create your first note to start writing in Markdown."
          action={
            <button className="notes-page__new" onClick={handleCreate}>
              <Icon name="plus" size={16} />
              New Note
            </button>
          }
        />
      )}

      {status === 'ready' && notes.length > 0 && (
        <div className="notes-page__layout">
          {showList && (
            <div className="notes-page__sidebar">
              <div className="notes-page__search">
                <Icon name="search" size={14} />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search notes…"
                  aria-label="Search notes"
                />
              </div>
              <NoteList notes={filtered} selectedId={selectedId} onSelect={setSelectedId} />
            </div>
          )}

          {(!isMobile || selectedNote) && (
            <div className="notes-page__editor">
              {isMobile && selectedNote && (
                <button className="notes-page__back" onClick={() => setSelectedId(null)}>
                  ← Back to notes
                </button>
              )}
              {selectedNote ? (
                <NoteEditorPane key={selectedNote.id} note={selectedNote} onDeleted={() => setSelectedId(null)} />
              ) : (
                <EmptyState icon={<Icon name="notes" size={28} />} title="Select a note" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
