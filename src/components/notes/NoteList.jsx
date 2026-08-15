import { truncate, formatRelativeTime } from '../../utils/formatting'
import './NoteList.css'

export function NoteList({ notes, selectedId, onSelect }) {
  return (
    <ul className="note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <button
            className={note.id === selectedId ? 'note-list__item note-list__item--active' : 'note-list__item'}
            onClick={() => onSelect(note.id)}
          >
            <span className="note-list__title">{note.title || 'Untitled note'}</span>
            <span className="note-list__preview">{truncate(note.content.replace(/[#*`>_-]/g, ''), 60)}</span>
            <span className="note-list__updated">{formatRelativeTime(note.updatedAt)}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}
