import { useCallback, useMemo } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import * as projectsStore from '../db/projectsStore'
import { useLogActivity } from './useLogActivity'

export function useProjects() {
  const { state, dispatch } = useWorkspace()
  const { items: projects, status, error } = state.projects
  const logActivity = useLogActivity()

  const createProject = useCallback(
    async (data) => {
      const project = projectsStore.buildProject(data)
      dispatch({ type: 'PROJECT_ADDED', payload: project })
      try {
        await projectsStore.saveProject(project)
        await logActivity({
          action: 'Created project',
          entityType: 'project',
          entityId: project.id,
          metadata: { name: project.name },
        })
        return project
      } catch (err) {
        dispatch({ type: 'PROJECT_REMOVED', payload: project.id })
        throw err
      }
    },
    [dispatch, logActivity],
  )

  const updateProject = useCallback(
    async (id, patch, activityLabel = 'Updated project') => {
      const previous = projects.find((p) => p.id === id)
      if (!previous) throw new Error(`Project ${id} not found.`)
      const optimistic = { ...previous, ...patch, updatedAt: new Date().toISOString() }
      dispatch({ type: 'PROJECT_UPDATED', payload: optimistic })
      try {
        const saved = await projectsStore.updateProject(id, patch)
        dispatch({ type: 'PROJECT_UPDATED', payload: saved })
        await logActivity({
          action: activityLabel,
          entityType: 'project',
          entityId: id,
          metadata: { name: saved.name },
        })
        return saved
      } catch (err) {
        dispatch({ type: 'PROJECT_UPDATED', payload: previous })
        throw err
      }
    },
    [dispatch, projects, logActivity],
  )

  const deleteProject = useCallback(
    async (id) => {
      const previous = projects.find((p) => p.id === id)
      if (!previous) return
      dispatch({ type: 'PROJECT_REMOVED', payload: id })
      try {
        await projectsStore.deleteProject(id)
        await logActivity({
          action: 'Deleted project',
          entityType: 'project',
          entityId: id,
          metadata: { name: previous.name },
        })
      } catch (err) {
        dispatch({ type: 'PROJECT_RESTORED', payload: previous })
        throw err
      }
    },
    [dispatch, projects, logActivity],
  )

  const archiveProject = useCallback((id) => updateProject(id, { archived: true }, 'Archived project'), [
    updateProject,
  ])
  const restoreProject = useCallback((id) => updateProject(id, { archived: false }, 'Restored project'), [
    updateProject,
  ])

  const getProject = useCallback((id) => projects.find((p) => p.id === id), [projects])

  const activeProjects = useMemo(() => projects.filter((p) => !p.archived), [projects])
  const archivedProjects = useMemo(() => projects.filter((p) => p.archived), [projects])

  return {
    projects,
    activeProjects,
    archivedProjects,
    status,
    error,
    getProject,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
  }
}
