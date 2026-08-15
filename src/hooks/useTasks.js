import { useCallback, useMemo } from 'react'
import { useWorkspace } from '../context/WorkspaceContext'
import * as tasksStore from '../db/tasksStore'
import { useLogActivity } from './useLogActivity'

const ORDER_STEP = 1000

export function useTasks() {
  const { state, dispatch } = useWorkspace()
  const { items: tasks, status, error } = state.tasks
  const logActivity = useLogActivity()

  const createTask = useCallback(
    async (data) => {
      const columnTasks = tasks.filter((t) => t.status === (data.status ?? 'backlog'))
      const maxOrder = columnTasks.reduce((max, t) => Math.max(max, t.order ?? 0), 0)
      const task = tasksStore.buildTask({ ...data, order: maxOrder + ORDER_STEP })
      dispatch({ type: 'TASK_ADDED', payload: task })
      try {
        await tasksStore.saveTask(task)
        await logActivity({
          action: 'Created task',
          entityType: 'task',
          entityId: task.id,
          metadata: { title: task.title },
        })
        return task
      } catch (err) {
        dispatch({ type: 'TASK_REMOVED', payload: task.id })
        throw err
      }
    },
    [dispatch, tasks, logActivity],
  )

  const updateTask = useCallback(
    async (id, patch, activityLabel = 'Updated task') => {
      const previous = tasks.find((t) => t.id === id)
      if (!previous) throw new Error(`Task ${id} not found.`)
      const optimistic = { ...previous, ...patch, updatedAt: new Date().toISOString() }
      dispatch({ type: 'TASK_UPDATED', payload: optimistic })
      try {
        const saved = await tasksStore.updateTask(id, patch)
        dispatch({ type: 'TASK_UPDATED', payload: saved })
        if (activityLabel) {
          await logActivity({
            action: activityLabel,
            entityType: 'task',
            entityId: id,
            metadata: { title: saved.title },
          })
        }
        return saved
      } catch (err) {
        dispatch({ type: 'TASK_UPDATED', payload: previous })
        throw err
      }
    },
    [dispatch, tasks, logActivity],
  )

  const deleteTask = useCallback(
    async (id) => {
      const previous = tasks.find((t) => t.id === id)
      if (!previous) return
      dispatch({ type: 'TASK_REMOVED', payload: id })
      try {
        await tasksStore.deleteTask(id)
        await logActivity({
          action: 'Deleted task',
          entityType: 'task',
          entityId: id,
          metadata: { title: previous.title },
        })
      } catch (err) {
        dispatch({ type: 'TASK_RESTORED', payload: previous })
        throw err
      }
    },
    [dispatch, tasks, logActivity],
  )

  /**
   * Moves a task to `targetStatus`, inserting it before `beforeTaskId` (or
   * at the end of the column if omitted). Reindexes the target column's
   * order values in one batch so drag-and-drop and the keyboard "Move to"
   * control share the same logic.
   */
  const moveTask = useCallback(
    async (taskId, targetStatus, beforeTaskId = null) => {
      const dragged = tasks.find((t) => t.id === taskId)
      if (!dragged) return

      const targetColumn = tasks
        .filter((t) => t.status === targetStatus && t.id !== taskId)
        .sort((a, b) => a.order - b.order)

      const insertIndex = beforeTaskId
        ? Math.max(0, targetColumn.findIndex((t) => t.id === beforeTaskId))
        : targetColumn.length

      const reordered = [...targetColumn]
      reordered.splice(insertIndex, 0, { ...dragged, status: targetStatus })

      const changed = reordered.map((t, index) => ({ ...t, order: (index + 1) * ORDER_STEP }))
      const previousById = new Map(tasks.map((t) => [t.id, t]))

      for (const task of changed) {
        dispatch({ type: 'TASK_UPDATED', payload: { ...task, updatedAt: new Date().toISOString() } })
      }

      try {
        const persisted = changed.map((t) => ({ ...t, updatedAt: new Date().toISOString() }))
        await tasksStore.reorderTasks(persisted)
        if (dragged.status !== targetStatus) {
          await logActivity({
            action: 'Moved task',
            entityType: 'task',
            entityId: taskId,
            metadata: { title: dragged.title, from: dragged.status, to: targetStatus },
          })
        }
      } catch (err) {
        for (const task of changed) {
          const original = previousById.get(task.id)
          if (original) dispatch({ type: 'TASK_UPDATED', payload: original })
        }
        throw err
      }
    },
    [dispatch, tasks, logActivity],
  )

  const getTasksByStatus = useCallback(
    (status) => tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order),
    [tasks],
  )

  const getTasksByProject = useCallback((projectId) => tasks.filter((t) => t.projectId === projectId), [tasks])

  const columns = useMemo(() => {
    const map = {}
    for (const task of tasks) {
      if (!map[task.status]) map[task.status] = []
      map[task.status].push(task)
    }
    for (const status in map) map[status].sort((a, b) => a.order - b.order)
    return map
  }, [tasks])

  return {
    tasks,
    columns,
    status,
    error,
    getTasksByStatus,
    getTasksByProject,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  }
}
