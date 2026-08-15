import { useCallback, useEffect, useState } from 'react'
import { estimateStorageUsage } from '../utils/storage'

export function useStorageEstimate() {
  const [estimate, setEstimate] = useState(null)
  const [supported, setSupported] = useState(true)

  const refresh = useCallback(() => {
    estimateStorageUsage().then((result) => {
      if (result === null) setSupported(false)
      else setEstimate(result)
    })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { estimate, supported, refresh }
}
