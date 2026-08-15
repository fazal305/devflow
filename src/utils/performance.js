/** Real Navigation Timing values, in whole milliseconds. Returns null if the API is unavailable. */
export function getNavigationTiming() {
  const [entry] = performance.getEntriesByType?.('navigation') ?? []
  if (!entry) return null

  return {
    ttfb: Math.round(entry.responseStart - entry.requestStart),
    domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.startTime),
    domInteractive: Math.round(entry.domInteractive - entry.startTime),
    loadComplete: Math.round(entry.loadEventEnd - entry.startTime),
  }
}

/** Chrome-only, non-standard API. Returns null everywhere else — never fabricated. */
export function getMemoryInfo() {
  const mem = performance.memory
  if (!mem) return null
  return {
    usedJSHeapSize: mem.usedJSHeapSize,
    totalJSHeapSize: mem.totalJSHeapSize,
    jsHeapSizeLimit: mem.jsHeapSizeLimit,
  }
}
