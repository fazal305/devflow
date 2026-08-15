import { useEffect, useState } from 'react'
import { getDB, isIndexedDBSupported } from '../db/database'

/**
 * Reports whether the shared IndexedDB connection is ready, so the app
 * can gate features or show a real error instead of failing silently.
 */
export function useIndexedDB() {
  const [state, setState] = useState({ status: 'checking', error: null })

  useEffect(() => {
    let cancelled = false

    if (!isIndexedDBSupported()) {
      setState({ status: 'unsupported', error: null })
      return undefined
    }

    getDB()
      .then(() => {
        if (!cancelled) setState({ status: 'ready', error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ status: 'error', error })
      })

    return () => {
      cancelled = true
    }
  }, [])

  return state
}
