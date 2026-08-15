import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Debounces a value and persists it via `save` once it settles.
 * Skips saving when the value is unchanged, flushes immediately on
 * unmount if a change is still pending, and exposes `flush` for
 * explicit saves (Ctrl+S, blur).
 *
 * Component using this should be `key`-ed per record (e.g. note.id) so
 * switching records resets the "already saved" baseline cleanly.
 */
export function useAutosave(value, save, { delay = 800 } = {}) {
  const [status, setStatus] = useState('idle') // idle | pending | saving | saved | error
  const [error, setError] = useState(null)

  const timeoutRef = useRef(null)
  const savedSignatureRef = useRef(JSON.stringify(value))
  const valueRef = useRef(value)
  const saveRef = useRef(save)
  valueRef.current = value
  saveRef.current = save

  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    const signature = JSON.stringify(valueRef.current)
    if (signature === savedSignatureRef.current) return
    setStatus('saving')
    try {
      await saveRef.current(valueRef.current)
      savedSignatureRef.current = signature
      setStatus('saved')
      setError(null)
    } catch (err) {
      setStatus('error')
      setError(err)
    }
  }, [])

  useEffect(() => {
    const signature = JSON.stringify(value)
    if (signature === savedSignatureRef.current) return undefined
    setStatus('pending')
    timeoutRef.current = setTimeout(flush, delay)
    return () => clearTimeout(timeoutRef.current)
  }, [value, delay, flush])

  useEffect(
    () => () => {
      if (timeoutRef.current) {
        const signature = JSON.stringify(valueRef.current)
        if (signature !== savedSignatureRef.current) {
          saveRef.current(valueRef.current).catch(() => {})
        }
      }
    },
    [],
  )

  return { status, error, flush }
}
