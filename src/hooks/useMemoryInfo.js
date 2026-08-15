import { useEffect, useState } from 'react'
import { getMemoryInfo } from '../utils/performance'

const POLL_INTERVAL_MS = 2000

export function useMemoryInfo() {
  const [memory, setMemory] = useState(() => getMemoryInfo())

  useEffect(() => {
    if (!performance.memory) return undefined
    const interval = setInterval(() => setMemory(getMemoryInfo()), POLL_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  return memory
}
