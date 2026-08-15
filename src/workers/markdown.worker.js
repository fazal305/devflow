import { marked } from 'marked'

marked.setOptions({ gfm: true, breaks: false })

self.onmessage = (event) => {
  const { id, markdown } = event.data
  try {
    const html = marked.parse(markdown ?? '')
    self.postMessage({ id, html })
  } catch (error) {
    self.postMessage({ id, error: error.message ?? 'Markdown parsing failed.' })
  }
}
