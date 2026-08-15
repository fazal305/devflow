import { useEffect, useState } from 'react'
import './LoadingIndicator.css'

const APPEAR_DELAY_MS = 200

/**
 * Renders nothing for the first 200ms so fast operations never flash a
 * spinner. Only operations that genuinely take a moment show feedback.
 */
export function LoadingIndicator({ label = 'Loading…', inline = false }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), APPEAR_DELAY_MS)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <div className={inline ? 'loading-indicator loading-indicator--inline' : 'loading-indicator'} role="status">
      <span className="loading-indicator__spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
