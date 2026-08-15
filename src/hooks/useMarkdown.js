import { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'
import { parseMarkdown } from '../workers/markdownWorkerClient'

/** Debounces Markdown input, parses it in a Web Worker, and sanitizes the result. */
export function useMarkdown(markdown, { delay = 200 } = {}) {
  const [html, setHtml] = useState('')
  const [status, setStatus] = useState('idle') // idle | processing | ready | error
  const [error, setError] = useState(null)
  const requestSeq = useRef(0)

  useEffect(() => {
    const seq = ++requestSeq.current
    setStatus('processing')

    const timer = setTimeout(async () => {
      try {
        const rawHtml = await parseMarkdown(markdown)
        if (seq !== requestSeq.current) return // superseded by newer input
        setHtml(DOMPurify.sanitize(rawHtml))
        setStatus('ready')
        setError(null)
      } catch (err) {
        if (seq !== requestSeq.current) return
        setStatus('error')
        setError(err)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [markdown, delay])

  return { html, status, error }
}
