import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { Badge } from '../common/Badge'
import { SNIPPET_LANGUAGES } from '../../config/snippetLanguages'
import { formatRelativeTime, truncate } from '../../utils/formatting'
import { copyToClipboard } from '../../utils/clipboard'
import './SnippetCard.css'

export function SnippetCard({ snippet, projectName, onEdit, onDuplicate, onDelete }) {
  const [copyState, setCopyState] = useState('idle') // idle | copied | error
  const languageMeta = SNIPPET_LANGUAGES.find((l) => l.value === snippet.language)

  const handleCopy = async () => {
    const ok = await copyToClipboard(snippet.code)
    setCopyState(ok ? 'copied' : 'error')
    setTimeout(() => setCopyState('idle'), 1500)
  }

  return (
    <div className="snippet-card">
      <div className="snippet-card__header">
        <span className="snippet-card__title">{snippet.title}</span>
        <Badge tone="neutral">{languageMeta?.label ?? snippet.language}</Badge>
      </div>

      {snippet.description && <p className="snippet-card__description">{snippet.description}</p>}

      <pre className="snippet-card__code">
        <code>{truncate(snippet.code, 220)}</code>
      </pre>

      {snippet.tags.length > 0 && (
        <div className="snippet-card__tags">
          {snippet.tags.map((tag) => (
            <span key={tag} className="snippet-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="snippet-card__footer">
        <div className="snippet-card__meta">
          {projectName && <Link to={`/projects`}>{projectName}</Link>}
          <span>Updated {formatRelativeTime(snippet.updatedAt)}</span>
        </div>
        <div className="snippet-card__actions">
          <button
            className={copyState === 'copied' ? 'snippet-card__copy snippet-card__copy--ok' : 'snippet-card__copy'}
            onClick={handleCopy}
            aria-label={`Copy code from ${snippet.title}`}
          >
            <Icon name={copyState === 'copied' ? 'check' : 'copy'} size={14} />
            {copyState === 'copied' ? 'Copied' : copyState === 'error' ? 'Copy failed' : 'Copy'}
          </button>
          <button aria-label={`Duplicate ${snippet.title}`} onClick={() => onDuplicate(snippet.id)}>
            <Icon name="copy" size={13} />
          </button>
          <button aria-label={`Edit ${snippet.title}`} onClick={() => onEdit(snippet)}>
            <Icon name="settings" size={13} />
          </button>
          <button aria-label={`Delete ${snippet.title}`} onClick={() => onDelete(snippet)}>
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
