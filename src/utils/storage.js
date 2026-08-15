/** Real browser storage quota/usage — returns null if the API is unavailable. */
export async function estimateStorageUsage() {
  if (!navigator.storage?.estimate) return null
  try {
    const { usage, quota } = await navigator.storage.estimate()
    return { usage: usage ?? 0, quota: quota ?? 0 }
  } catch {
    return null
  }
}

/** Approximate on-disk size of a set of records — exact IndexedDB byte accounting isn't exposed by the platform. */
export function approximateByteSize(items) {
  if (items.length === 0) return 0
  return new Blob([JSON.stringify(items)]).size
}

export function computeStoreStats(items, timestampField = 'updatedAt') {
  const lastUpdated = items.reduce((latest, item) => {
    const value = item[timestampField]
    return value && (!latest || value > latest) ? value : latest
  }, null)

  return {
    count: items.length,
    bytes: approximateByteSize(items),
    lastUpdated,
  }
}
