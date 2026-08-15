import { useMarkdown } from '../../hooks/useMarkdown'
import { LoadingIndicator } from '../common/LoadingIndicator'
import './MarkdownPreview.css'

export function MarkdownPreview({ markdown }) {
  const { html, status, error } = useMarkdown(markdown)

  return (
    <div className="markdown-preview">
      {status === 'processing' && !html && <LoadingIndicator label="Processing document…" inline />}
      {status === 'error' && (
        <p className="markdown-preview__error">Failed to render preview: {error?.message}</p>
      )}
      {markdown.trim() === '' ? (
        <p className="markdown-preview__empty">Nothing to preview yet.</p>
      ) : (
        <div className="markdown-preview__content" dangerouslySetInnerHTML={{ __html: html }} />
      )}
    </div>
  )
}
