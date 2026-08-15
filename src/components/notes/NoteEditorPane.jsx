import { useMemo, useState } from 'react'
import { MarkdownEditor } from '../editor/MarkdownEditor'
import { MarkdownPreview } from '../editor/MarkdownPreview'
import { AutosaveStatus } from '../common/AutosaveStatus'
import { ConfirmDialog } from '../common/ConfirmDialog'
import { Icon } from '../common/Icon'
import { SummarizePanel } from '../ai/SummarizePanel'
import { useAutosave } from '../../hooks/useAutosave'
import { useNotes } from '../../hooks/useNotes'
import { useProjects } from '../../hooks/useProjects'
import { parseTagsInput } from '../../utils/validation'
import { saveTextFile, downloadBlob } from '../../services/fileSystem'
import './NoteEditorPane.css'

/** Keyed by note.id from the parent so switching notes resets all local + autosave state. */
export function NoteEditorPane({ note, onDeleted }) {
  const { updateNote, deleteNote, duplicateNote } = useNotes()
  const { activeProjects } = useProjects()

  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [projectId, setProjectId] = useState(note.projectId ?? '')
  const [tagsInput, setTagsInput] = useState(note.tags.join(', '))
  const [view, setView] = useState('write')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [summarizing, setSummarizing] = useState(false)

  const draft = useMemo(
    () => ({ title, content, projectId: projectId || null, tags: parseTagsInput(tagsInput) }),
    [title, content, projectId, tagsInput],
  )

  const { status } = useAutosave(
    draft,
    (value) => updateNote(note.id, value, { silent: true }),
    { delay: 800 },
  )

  const handleDuplicate = () => duplicateNote(note.id)

  const handleExportMarkdown = () => {
    const filename = `${(title || 'untitled-note').trim().replace(/[\\/:*?"<>|]+/g, '-')}.md`
    saveTextFile(content, {
      suggestedName: filename,
      mimeType: 'text/markdown',
      extension: '.md',
      fallback: () => downloadBlob(content, filename, 'text/markdown'),
    })
  }

  const handleDelete = () => {
    deleteNote(note.id)
    onDeleted?.()
  }

  return (
    <div className="note-editor">
      <div className="note-editor__meta">
        <input
          className="note-editor__title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          aria-label="Note title"
        />
        <div className="note-editor__meta-row">
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            aria-label="Assign to project"
          >
            <option value="">No project</option>
            {activeProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            className="note-editor__tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="tags, comma, separated"
            aria-label="Tags"
          />
          <AutosaveStatus status={status} />
        </div>
      </div>

      <div className="note-editor__toolbar-row">
        <div className="note-editor__view-toggle" role="tablist" aria-label="Editor view">
          <button
            role="tab"
            aria-selected={view === 'write'}
            className={view === 'write' ? 'active' : ''}
            onClick={() => setView('write')}
          >
            Write
          </button>
          <button
            role="tab"
            aria-selected={view === 'preview'}
            className={view === 'preview' ? 'active' : ''}
            onClick={() => setView('preview')}
          >
            Preview
          </button>
        </div>
        <div className="note-editor__actions">
          <button onClick={() => setSummarizing(true)} aria-label="Summarize note with local AI">
            <Icon name="sparkle" size={14} />
            Summarize
          </button>
          <button onClick={handleExportMarkdown} aria-label="Export note as Markdown file">
            <Icon name="download" size={14} />
            Export
          </button>
          <button onClick={handleDuplicate} aria-label="Duplicate note">
            <Icon name="copy" size={14} />
            Duplicate
          </button>
          <button onClick={() => setConfirmingDelete(true)} aria-label="Delete note">
            <Icon name="trash" size={14} />
            Delete
          </button>
        </div>
      </div>

      <div className="note-editor__panes" data-view={view}>
        <div className="note-editor__pane note-editor__pane--write">
          <MarkdownEditor value={content} onChange={setContent} />
        </div>
        <div className="note-editor__pane note-editor__pane--preview">
          <MarkdownPreview markdown={content} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={handleDelete}
        title="Delete note?"
        description={`"${title || 'Untitled note'}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete note"
      />

      <SummarizePanel open={summarizing} onClose={() => setSummarizing(false)} text={content} />
    </div>
  )
}
