import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Icon } from '../components/common/Icon'
import { TaskBoard } from '../components/tasks/TaskBoard'
import { TaskForm } from '../components/tasks/TaskForm'
import { useTasks } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useOpenCreateSignal } from '../hooks/useOpenCreateSignal'
import './Tasks.css'

export default function Tasks() {
  const { tasks, status, error, createTask, updateTask, deleteTask, moveTask } = useTasks()
  const { projects } = useProjects()

  const [formState, setFormState] = useState(null) // null | { mode:'create', status } | { mode:'edit', task }
  const [pendingDelete, setPendingDelete] = useState(null)

  useOpenCreateSignal(() => setFormState({ mode: 'create', status: 'backlog' }))

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects])

  const handleSubmit = async (data) => {
    if (formState?.mode === 'edit') {
      await updateTask(formState.task.id, data)
    } else {
      await createTask({ ...data, status: data.status ?? formState?.status ?? 'backlog' })
    }
  }

  return (
    <div className="tasks-page">
      <PageHeader
        title="Tasks"
        description="A Kanban board for developer work: Backlog through Done."
        actions={
          <button className="tasks-page__new" onClick={() => setFormState({ mode: 'create', status: 'backlog' })}>
            <Icon name="plus" size={16} />
            New Task
          </button>
        }
      />

      {status === 'loading' && <LoadingIndicator label="Loading tasks…" />}
      {status === 'error' && <p className="tasks-page__error">Failed to load tasks: {error?.message}</p>}

      {status === 'ready' && (
        <TaskBoard
          tasks={tasks}
          projectsById={projectsById}
          onCreate={(columnStatus) => setFormState({ mode: 'create', status: columnStatus })}
          onEdit={(task) => setFormState({ mode: 'edit', task })}
          onDelete={setPendingDelete}
          onMoveTo={(taskId, targetStatus) => moveTask(taskId, targetStatus)}
          onMove={(taskId, targetStatus, beforeTaskId) => moveTask(taskId, targetStatus, beforeTaskId)}
        />
      )}

      {formState && (
        <TaskForm
          key={formState.mode === 'edit' ? formState.task.id : `create-${formState.status}`}
          open
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          initialValue={formState.mode === 'edit' ? formState.task : undefined}
          defaultStatus={formState.mode === 'create' ? formState.status : 'backlog'}
          title={formState.mode === 'edit' ? 'Edit task' : 'New task'}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteTask(pendingDelete.id)}
        title="Delete task?"
        description={pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.` : ''}
        confirmLabel="Delete task"
      />
    </div>
  )
}
