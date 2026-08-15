const UNITS = [
  ['year', 31536000],
  ['month', 2592000],
  ['week', 604800],
  ['day', 86400],
  ['hour', 3600],
  ['minute', 60],
]

export function formatRelativeTime(isoString) {
  const then = new Date(isoString).getTime()
  if (Number.isNaN(then)) return ''
  const seconds = Math.round((Date.now() - then) / 1000)
  if (seconds < 45) return 'just now'

  for (const [unit, secondsInUnit] of UNITS) {
    const amount = Math.floor(seconds / secondsInUnit)
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`
  }
  return 'just now'
}

export function truncate(text, max = 140) {
  if (!text || text.length <= max) return text ?? ''
  return `${text.slice(0, max - 1).trimEnd()}…`
}

export function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) return 'Unavailable'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`
}
