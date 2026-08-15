import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Icon } from '../components/common/Icon'
import { ProjectCard } from '../components/projects/ProjectCard'
import { ProjectForm } from '../components/projects/ProjectForm'
import { useProjects } from '../hooks/useProjects'
import { useOpenCreateSignal } from '../hooks/useOpenCreateSignal'
import './Projects.css'

export default function Projects() {
  const {
    activeProjects,
    archivedProjects,
    status,
    error,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
    restoreProject,
  } = useProjects()

  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [formState, setFormState] = useState(null) // null | { mode: 'create' } | { mode: 'edit', project }
  const [pendingDelete, setPendingDelete] = useState(null)

  useOpenCreateSignal(() => setFormState({ mode: 'create' }))

  const source = showArchived ? archivedProjects : activeProjects
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return source
    return source.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((tag) => tag.toLowerCase().includes(q)),
    )
  }, [source, query])

  const handleSubmit = async (data) => {
    if (formState?.mode === 'edit') {
      await updateProject(formState.project.id, data)
    } else {
      await createProject(data)
    }
  }

  return (
    <>
      <PageHeader
        title="Projects"
        description="Create, organize, and archive your project workspaces."
        actions={
          <button className="projects-page__new" onClick={() => setFormState({ mode: 'create' })}>
            <Icon name="plus" size={16} />
            New Project
          </button>
        }
      />

      <div className="projects-page__toolbar">
        <div className="projects-page__search">
          <Icon name="search" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
          />
        </div>
        <div className="projects-page__tabs" role="tablist" aria-label="Project filter">
          <button
            role="tab"
            aria-selected={!showArchived}
            className={!showArchived ? 'projects-page__tab projects-page__tab--active' : 'projects-page__tab'}
            onClick={() => setShowArchived(false)}
          >
            Active ({activeProjects.length})
          </button>
          <button
            role="tab"
            aria-selected={showArchived}
            className={showArchived ? 'projects-page__tab projects-page__tab--active' : 'projects-page__tab'}
            onClick={() => setShowArchived(true)}
          >
            Archived ({archivedProjects.length})
          </button>
        </div>
      </div>

      {status === 'loading' && <LoadingIndicator label="Loading projects…" />}

      {status === 'error' && (
        <p className="projects-page__error">Failed to load projects: {error?.message}</p>
      )}

      {status === 'ready' && filtered.length === 0 && (
        <EmptyState
          icon={<Icon name="projects" size={28} />}
          title={query ? 'No projects match your search' : showArchived ? 'No archived projects' : 'No projects yet'}
          description={
            !query && !showArchived
              ? 'Create your first project to start organizing notes, tasks, and snippets.'
              : undefined
          }
          action={
            !query && !showArchived ? (
              <button className="projects-page__new" onClick={() => setFormState({ mode: 'create' })}>
                <Icon name="plus" size={16} />
                New Project
              </button>
            ) : undefined
          }
        />
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="projects-page__grid">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={(p) => setFormState({ mode: 'edit', project: p })}
              onDelete={setPendingDelete}
              onArchive={archiveProject}
              onRestore={restoreProject}
            />
          ))}
        </div>
      )}

      {formState && (
        <ProjectForm
          key={formState.mode === 'edit' ? formState.project.id : 'create'}
          open
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          initialValue={formState.mode === 'edit' ? formState.project : undefined}
          title={formState.mode === 'edit' ? 'Edit project' : 'New project'}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteProject(pendingDelete.id)}
        title="Delete project?"
        description={
          pendingDelete
            ? `"${pendingDelete.name}" will be permanently removed. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete project"
      />
    </>
  )
}
