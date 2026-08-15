import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { EmptyState } from '../components/common/EmptyState'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Badge } from '../components/common/Badge'
import { ComingSoon } from '../components/common/ComingSoon'
import { Icon } from '../components/common/Icon'
import { ProjectForm } from '../components/projects/ProjectForm'
import { useProjects } from '../hooks/useProjects'
import { useNotes } from '../hooks/useNotes'
import { useTasks } from '../hooks/useTasks'
import { useSnippets } from '../hooks/useSnippets'
import { PROJECT_STATUSES } from '../config/projectOptions'
import { TASK_STATUSES } from '../config/taskOptions'
import { formatRelativeTime, truncate } from '../utils/formatting'
import './ProjectWorkspace.css'

export default function ProjectWorkspace() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { getProject, status, updateProject, deleteProject, archiveProject, restoreProject } = useProjects()
  const { getNotesByProject, createNote } = useNotes()
  const { getTasksByProject, createTask } = useTasks()
  const { getSnippetsByProject, createSnippet } = useSnippets()
  const [editing, setEditing] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  if (status === 'loading') return <LoadingIndicator label="Loading project…" />

  const project = getProject(projectId)

  if (!project) {
    return (
      <EmptyState
        icon={<Icon name="projects" size={28} />}
        title="Project not found"
        description="It may have been deleted, or the link is out of date."
        action={
          <button className="project-workspace__back" onClick={() => navigate('/projects')}>
            Back to Projects
          </button>
        }
      />
    )
  }

  const statusMeta = PROJECT_STATUSES.find((s) => s.value === project.status)

  return (
    <>
      <PageHeader
        title={project.name}
        description={project.description || 'No description yet.'}
        actions={
          <div className="project-workspace__actions">
            <button onClick={() => setEditing(true)}>
              <Icon name="settings" size={15} />
              Edit
            </button>
            {project.archived ? (
              <button onClick={() => restoreProject(project.id)}>
                <Icon name="check" size={15} />
                Restore
              </button>
            ) : (
              <button onClick={() => archiveProject(project.id)}>
                <Icon name="storage" size={15} />
                Archive
              </button>
            )}
            <button className="project-workspace__delete" onClick={() => setConfirmingDelete(true)}>
              <Icon name="trash" size={15} />
              Delete
            </button>
          </div>
        }
      />

      <div className="project-workspace__meta">
        {statusMeta && <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>}
        {project.archived && <Badge tone="neutral">Archived</Badge>}
        {project.tags.map((tag) => (
          <span key={tag} className="project-workspace__tag">
            {tag}
          </span>
        ))}
        <span className="project-workspace__updated">Updated {formatRelativeTime(project.updatedAt)}</span>
      </div>

      <div className="project-workspace__sections">
        <section>
          <h2>Notes</h2>
          <ProjectNotesList projectId={project.id} notes={getNotesByProject(project.id)} createNote={createNote} />
        </section>
        <section>
          <h2>Tasks</h2>
          <ProjectTasksList projectId={project.id} tasks={getTasksByProject(project.id)} createTask={createTask} />
        </section>
        <section>
          <h2>Snippets</h2>
          <ProjectSnippetsList
            projectId={project.id}
            snippets={getSnippetsByProject(project.id)}
            createSnippet={createSnippet}
          />
        </section>
        <section>
          <h2>Activity</h2>
          <ComingSoon step="Step 10" />
        </section>
      </div>

      {editing && (
        <ProjectForm
          key={project.id}
          open
          onClose={() => setEditing(false)}
          onSubmit={(data) => updateProject(project.id, data)}
          initialValue={project}
          title="Edit project"
        />
      )}

      <ConfirmDialog
        open={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={() => {
          deleteProject(project.id)
          navigate('/projects')
        }}
        title="Delete project?"
        description={`"${project.name}" will be permanently removed. This cannot be undone.`}
        confirmLabel="Delete project"
      />
    </>
  )
}

function ProjectTasksList({ projectId, tasks, createTask }) {
  const navigate = useNavigate()

  const handleCreate = async () => {
    await createTask({ title: 'Untitled task', description: '', projectId })
    navigate('/tasks')
  }

  if (tasks.length === 0) {
    return (
      <button className="project-workspace__add-note" onClick={handleCreate}>
        <Icon name="plus" size={14} />
        Add a task
      </button>
    )
  }

  return (
    <ul className="project-workspace__note-list">
      {tasks.map((task) => {
        const statusMeta = TASK_STATUSES.find((s) => s.value === task.status)
        return (
          <li key={task.id}>
            <Link to="/tasks">
              <span>{task.title}</span>
              <span className="project-workspace__note-preview">{statusMeta?.label ?? task.status}</span>
            </Link>
          </li>
        )
      })}
      <li>
        <button className="project-workspace__add-note" onClick={handleCreate}>
          <Icon name="plus" size={14} />
          Add a task
        </button>
      </li>
    </ul>
  )
}

function ProjectSnippetsList({ projectId, snippets, createSnippet }) {
  const navigate = useNavigate()

  const handleCreate = async () => {
    await createSnippet({ title: 'Untitled snippet', code: '', projectId })
    navigate('/snippets')
  }

  if (snippets.length === 0) {
    return (
      <button className="project-workspace__add-note" onClick={handleCreate}>
        <Icon name="plus" size={14} />
        Add a snippet
      </button>
    )
  }

  return (
    <ul className="project-workspace__note-list">
      {snippets.map((snippet) => (
        <li key={snippet.id}>
          <Link to="/snippets">
            <span>{snippet.title}</span>
            <span className="project-workspace__note-preview">{snippet.language}</span>
          </Link>
        </li>
      ))}
      <li>
        <button className="project-workspace__add-note" onClick={handleCreate}>
          <Icon name="plus" size={14} />
          Add a snippet
        </button>
      </li>
    </ul>
  )
}

function ProjectNotesList({ projectId, notes, createNote }) {
  const navigate = useNavigate()

  const handleCreate = async () => {
    const note = await createNote({ title: 'Untitled note', content: '', projectId })
    navigate(`/notes?note=${note.id}`)
  }

  if (notes.length === 0) {
    return (
      <button className="project-workspace__add-note" onClick={handleCreate}>
        <Icon name="plus" size={14} />
        Add a note
      </button>
    )
  }

  return (
    <ul className="project-workspace__note-list">
      {notes.map((note) => (
        <li key={note.id}>
          <Link to={`/notes?note=${note.id}`}>
            <span>{note.title || 'Untitled note'}</span>
            <span className="project-workspace__note-preview">{truncate(note.content, 60)}</span>
            <span className="project-workspace__note-updated">{formatRelativeTime(note.updatedAt)}</span>
          </Link>
        </li>
      ))}
      <li>
        <button className="project-workspace__add-note" onClick={handleCreate}>
          <Icon name="plus" size={14} />
          Add a note
        </button>
      </li>
    </ul>
  )
}
