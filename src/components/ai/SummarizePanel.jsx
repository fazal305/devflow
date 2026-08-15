import { useEffect, useRef } from 'react'
import { Modal } from '../common/Modal'
import { Icon } from '../common/Icon'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { useAISummarizer } from '../../hooks/useAISummarizer'
import { copyToClipboard } from '../../utils/clipboard'
import './SummarizePanel.css'

export function SummarizePanel({ open, onClose, text }) {
  const { status, progress, summary, error, summarize, reset } = useAISummarizer()
  const startedFor = useRef(null)

  useEffect(() => {
    if (open && startedFor.current !== text) {
      startedFor.current = text
      summarize(text)
    }
    if (!open) {
      startedFor.current = null
      reset()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Modal open={open} onClose={onClose} labelledBy="summarize-title" className="summarize-panel">
      <div className="summarize-panel__header">
        <Icon name="sparkle" size={16} />
        <h2 id="summarize-title">Summarize with local AI</h2>
      </div>
      <p className="summarize-panel__disclaimer">
        Runs entirely in your browser — the note never leaves your device. The model (~150MB) downloads once
        and is cached for next time.
      </p>

      <div className="summarize-panel__body">
        {status === 'downloading' && (
          <div className="summarize-panel__progress">
            <LoadingIndicator label="Downloading model…" inline />
            {progress !== null && (
              <div className="summarize-panel__bar">
                <div className="summarize-panel__bar-fill" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {status === 'running' && <LoadingIndicator label="Generating summary…" inline />}

        {status === 'error' && (
          <div className="summarize-panel__error">
            <p>{error}</p>
            <button onClick={() => summarize(text)}>Try again</button>
          </div>
        )}

        {status === 'done' && (
          <div className="summarize-panel__result">
            <p>{summary}</p>
            <button onClick={() => copyToClipboard(summary)}>
              <Icon name="copy" size={13} />
              Copy summary
            </button>
          </div>
        )}
      </div>
    </Modal>
  )
}
