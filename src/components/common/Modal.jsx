import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './Modal.css'

/**
 * Accessible dialog primitive reused by confirmations, the command palette,
 * and any other overlay in the app — one implementation of focus handling.
 */
export function Modal({ open, onClose, title, children, labelledBy, className = '' }) {
  const panelRef = useRef(null)
  const triggerRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    triggerRef.current = document.activeElement
    const panel = panelRef.current
    const focusable = panel?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    focusable?.[0]?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }
      if (event.key !== 'Tab' || !focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      triggerRef.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={panelRef}
        className={`modal-panel ${className}`}
        role="dialog"
        aria-modal="true"
        aria-label={labelledBy ? undefined : title}
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>,
    document.body,
  )
}
