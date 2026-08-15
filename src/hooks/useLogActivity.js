import { useCallback } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import { logActivity as persistActivity } from '../db/activityStore'

/** Persists an activity entry and pushes it into shared state so the Activity page and Dashboard update live. */
export function useLogActivity() {
  const { dispatch } = useWorkspace()
  return useCallback(
    async (entry) => {
      const saved = await persistActivity(entry)
      dispatch({ type: 'ACTIVITY_ADDED', payload: saved })
      return saved
    },
    [dispatch],
  )
}
