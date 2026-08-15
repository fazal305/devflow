import { useEffect, useState } from 'react'

const SAMPLE_INTERVAL_MS = 500

/** Real, continuously measured frame rate via requestAnimationFrame — never a fabricated number. */
export function useFPS() {
  const [fps, setFps] = useState(null)

  useEffect(() => {
    let frameCount = 0
    let windowStart = performance.now()
    let rafId

    const tick = (now) => {
      frameCount += 1
      const elapsed = now - windowStart
      if (elapsed >= SAMPLE_INTERVAL_MS) {
        setFps(Math.round((frameCount * 1000) / elapsed))
        frameCount = 0
        windowStart = now
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [])

  return fps
}
