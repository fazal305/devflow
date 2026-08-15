import { useMemo } from 'react'
import { COMMANDS } from '../config/commands'

/** Filters the static command list by label — matches everything when the query is empty. */
export function useCommandPalette(query) {
  return useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return COMMANDS
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q))
  }, [query])
}
