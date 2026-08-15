import { useNetwork } from '../../context/NetworkContext'
import './AutosaveStatus.css'

const LABELS = {
  idle: null,
  pending: 'Unsaved changes',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
}

export function AutosaveStatus({ status }) {
  const { isOnline } = useNetwork()
  const label = LABELS[status]
  if (!label) return null

  return (
    <span className={`autosave-status autosave-status--${status}`}>
      {label}
      {!isOnline && status === 'saved' && ' (offline — stored locally)'}
    </span>
  )
}
