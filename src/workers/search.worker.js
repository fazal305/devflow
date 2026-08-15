// Maintains an in-memory inverted index so querying never re-scans raw text.
let docsById = new Map()
let titleTokens = new Map() // doc id -> Set<token>
let tagTokens = new Map()
let bodyTokens = new Map()

function tokenize(text) {
  if (!text) return []
  return text.toLowerCase().match(/[a-z0-9]+/g) ?? []
}

function buildIndex(docs) {
  docsById = new Map()
  titleTokens = new Map()
  tagTokens = new Map()
  bodyTokens = new Map()

  for (const doc of docs) {
    docsById.set(doc.id, doc)
    titleTokens.set(doc.id, new Set(tokenize(doc.title)))
    tagTokens.set(doc.id, new Set((doc.tags ?? []).flatMap(tokenize)))
    bodyTokens.set(doc.id, new Set(tokenize(doc.subtitle)))
  }
}

function tokenSetMatches(tokenSet, queryToken) {
  for (const token of tokenSet) {
    if (token.startsWith(queryToken)) return true
  }
  return false
}

function search(query, limit = 8) {
  const queryTokens = tokenize(query)
  if (queryTokens.length === 0) return []

  const scored = []

  for (const [id, doc] of docsById) {
    let score = 0
    let matchedAllTokens = true

    for (const qt of queryTokens) {
      const inTitle = tokenSetMatches(titleTokens.get(id), qt)
      const inTags = tokenSetMatches(tagTokens.get(id), qt)
      const inBody = tokenSetMatches(bodyTokens.get(id), qt)

      if (inTitle) score += 3
      if (inTags) score += 2
      if (inBody) score += 1

      if (!inTitle && !inTags && !inBody) {
        matchedAllTokens = false
        break
      }
    }

    if (matchedAllTokens) scored.push({ ...doc, score })
  }

  scored.sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt))
  return scored.slice(0, limit)
}

self.onmessage = (event) => {
  const { id, kind, docs, query, limit } = event.data
  try {
    if (kind === 'index') {
      buildIndex(docs)
      self.postMessage({ id, indexed: docsById.size })
    } else if (kind === 'query') {
      const results = search(query, limit)
      self.postMessage({ id, results })
    }
  } catch (error) {
    self.postMessage({ id, error: error.message ?? 'Search failed.' })
  }
}
