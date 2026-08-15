import { useRef } from 'react'
import { Icon } from '../common/Icon'
import './MarkdownEditor.css'

const TOOLBAR_ACTIONS = [
  { id: 'bold', label: 'Bold', before: '**', after: '**', placeholder: 'bold text' },
  { id: 'italic', label: 'Italic', before: '_', after: '_', placeholder: 'italic text' },
  { id: 'heading', label: 'Heading', before: '## ', after: '', placeholder: 'Heading' },
  { id: 'link', label: 'Link', before: '[', after: '](https://)', placeholder: 'label' },
  { id: 'code', label: 'Inline code', before: '`', after: '`', placeholder: 'code' },
  { id: 'codeblock', label: 'Code block', before: '```\n', after: '\n```', placeholder: 'code' },
  { id: 'quote', label: 'Blockquote', before: '> ', after: '', placeholder: 'Quote' },
  { id: 'list', label: 'List', before: '- ', after: '', placeholder: 'List item' },
  { id: 'table', label: 'Table', before: '', after: '', placeholder: '' },
]

const TABLE_SNIPPET = '| Column | Column |\n| --- | --- |\n| Cell | Cell |\n'

export function MarkdownEditor({ value, onChange }) {
  const textareaRef = useRef(null)

  const applyAction = (action) => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { selectionStart, selectionEnd } = textarea
    const selected = value.slice(selectionStart, selectionEnd)

    let insertion
    let cursorOffset
    if (action.id === 'table') {
      insertion = TABLE_SNIPPET
      cursorOffset = insertion.length
    } else {
      const content = selected || action.placeholder
      insertion = `${action.before}${content}${action.after}`
      cursorOffset = selected ? insertion.length : action.before.length + content.length
    }

    const next = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd)
    onChange(next)

    requestAnimationFrame(() => {
      textarea.focus()
      const cursor = selectionStart + cursorOffset
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  return (
    <div className="markdown-editor">
      <div className="markdown-editor__toolbar" role="toolbar" aria-label="Formatting">
        {TOOLBAR_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            aria-label={action.label}
            title={action.label}
            onClick={() => applyAction(action)}
          >
            {action.id === 'bold' && 'B'}
            {action.id === 'italic' && 'I'}
            {action.id === 'heading' && 'H'}
            {action.id === 'link' && <Icon name="copy" size={14} />}
            {action.id === 'code' && '{ }'}
            {action.id === 'codeblock' && '{ }{ }'}
            {action.id === 'quote' && '"'}
            {action.id === 'list' && '•'}
            {action.id === 'table' && '▦'}
          </button>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="markdown-editor__textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write Markdown…"
        spellCheck="true"
        aria-label="Note content (Markdown)"
      />
    </div>
  )
}
