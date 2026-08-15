import { pipeline, env } from '@xenova/transformers'

// Never try to load models from a local server path — always fetch from the
// HuggingFace CDN and cache them in the browser via the Cache API.
env.allowLocalModels = false

const MODEL_ID = 'Xenova/distilbart-cnn-6-6'

let summarizerPromise = null

function getSummarizer(requestId) {
  if (!summarizerPromise) {
    summarizerPromise = pipeline('summarization', MODEL_ID, {
      progress_callback: (progress) => {
        self.postMessage({ id: requestId, kind: 'progress', progress })
      },
    }).catch((error) => {
      summarizerPromise = null // allow retry on next request
      throw error
    })
  }
  return summarizerPromise
}

self.onmessage = async (event) => {
  const { id, kind, text } = event.data

  if (kind !== 'summarize') return

  try {
    const summarizer = await getSummarizer(id)
    const trimmed = (text ?? '').trim()
    if (!trimmed) {
      self.postMessage({ id, kind: 'error', error: 'Nothing to summarize.' })
      return
    }

    const output = await summarizer(trimmed, {
      max_new_tokens: 80,
      min_new_tokens: 12,
    })

    self.postMessage({ id, kind: 'result', summary: output[0]?.summary_text ?? '' })
  } catch (error) {
    self.postMessage({ id, kind: 'error', error: error?.message ?? 'AI summarization failed.' })
  }
}
