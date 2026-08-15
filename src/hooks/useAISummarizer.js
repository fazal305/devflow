import { useCallback, useState } from 'react'
import { summarizeText, isAIWorkerSupported } from '../workers/aiWorkerClient'

export function useAISummarizer() {
  const [status, setStatus] = useState('idle') // idle | downloading | running | done | error
  const [progress, setProgress] = useState(null)
  const [summary, setSummary] = useState('')
  const [error, setError] = useState(null)

  const summarize = useCallback(async (text) => {
    if (!isAIWorkerSupported()) {
      setStatus('error')
      setError('Web Workers are not supported in this browser.')
      return
    }

    setStatus('downloading')
    setProgress(0)
    setError(null)
    setSummary('')

    try {
      const result = await summarizeText(text, {
        onProgress: (p) => {
          if (typeof p.progress === 'number') setProgress(Math.round(p.progress))
          if (p.status === 'ready') setStatus('running')
        },
      })
      setSummary(result)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setError(err.message)
    }
  }, [])

  const reset = useCallback(() => {
    setStatus('idle')
    setProgress(null)
    setSummary('')
    setError(null)
  }, [])

  return { status, progress, summary, error, summarize, reset }
}
