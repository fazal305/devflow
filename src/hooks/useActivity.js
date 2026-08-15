import { useMemo } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'

export function useActivity() {
  const { state } = useWorkspace()
  const { items, status, error } = state.activity

  const sorted = useMemo(() => [...items].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [items])

  return { activity: sorted, status, error }
}
