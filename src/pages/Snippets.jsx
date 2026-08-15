import { useMemo, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { ConfirmDialog } from '../components/common/ConfirmDialog'
import { Icon } from '../components/common/Icon'
import { SnippetCard } from '../components/snippets/SnippetCard'
import { SnippetForm } from '../components/snippets/SnippetForm'
import { useSnippets } from '../hooks/useSnippets'
import { useProjects } from '../hooks/useProjects'
import { useOpenCreateSignal } from '../hooks/useOpenCreateSignal'
import { SNIPPET_LANGUAGES } from '../config/snippetLanguages'
import './Snippets.css'

export default function Snippets() {
  const { snippets, status, error, createSnippet, updateSnippet, deleteSnippet, duplicateSnippet } = useSnippets()
  const { projects } = useProjects()

  const [query, setQuery] = useState('')
  const [languageFilter, setLanguageFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [formState, setFormState] = useState(null) // null | {mode:'create'} | {mode:'edit', snippet}
  const [pendingDelete, setPendingDelete] = useState(null)

  useOpenCreateSignal(() => setFormState({ mode: 'create' }))

  const projectsById = useMemo(() => Object.fromEntries(projects.map((p) => [p.id, p.name])), [projects])

  const usedLanguages = useMemo(
    () => SNIPPET_LANGUAGES.filter((lang) => snippets.some((s) => s.language === lang.value)),
    [snippets],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return snippets.filter((s) => {
      if (languageFilter !== 'all' && s.language !== languageFilter) return false
      if (projectFilter !== 'all' && s.projectId !== projectFilter) return false
      if (!q) return true
      return (
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
      )
    })
  }, [snippets, query, languageFilter, projectFilter])

  const handleSubmit = async (data) => {
    if (formState?.mode === 'edit') {
      await updateSnippet(formState.snippet.id, data)
    } else {
      await createSnippet(data)
    }
  }

  return (
    <>
      <PageHeader
        title="Snippets"
        description="Organize reusable code snippets by language, tag, and project."
        actions={
          <button className="snippets-page__new" onClick={() => setFormState({ mode: 'create' })}>
            <Icon name="plus" size={16} />
            New Snippet
          </button>
        }
      />

      <div className="snippets-page__toolbar">
        <div className="snippets-page__search">
          <Icon name="search" size={15} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets…"
            aria-label="Search snippets"
          />
        </div>
        <select
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          aria-label="Filter by language"
        >
          <option value="all">All languages</option>
          {usedLanguages.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          aria-label="Filter by project"
        >
          <option value="all">All projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {status === 'loading' && <LoadingIndicator label="Loading snippets…" />}
      {status === 'error' && <p className="snippets-page__error">Failed to load snippets: {error?.message}</p>}

      {status === 'ready' && filtered.length === 0 && (
        <EmptyState
          icon={<Icon name="snippets" size={28} />}
          title={query || languageFilter !== 'all' || projectFilter !== 'all' ? 'No snippets match' : 'No snippets yet'}
          description={
            snippets.length === 0 ? 'Save your first reusable piece of code.' : undefined
          }
          action={
            snippets.length === 0 ? (
              <button className="snippets-page__new" onClick={() => setFormState({ mode: 'create' })}>
                <Icon name="plus" size={16} />
                New Snippet
              </button>
            ) : undefined
          }
        />
      )}

      {status === 'ready' && filtered.length > 0 && (
        <div className="snippets-page__grid">
          {filtered.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              projectName={snippet.projectId ? projectsById[snippet.projectId] : null}
              onEdit={(s) => setFormState({ mode: 'edit', snippet: s })}
              onDuplicate={duplicateSnippet}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      {formState && (
        <SnippetForm
          key={formState.mode === 'edit' ? formState.snippet.id : 'create'}
          open
          onClose={() => setFormState(null)}
          onSubmit={handleSubmit}
          initialValue={formState.mode === 'edit' ? formState.snippet : undefined}
          title={formState.mode === 'edit' ? 'Edit snippet' : 'New snippet'}
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteSnippet(pendingDelete.id)}
        title="Delete snippet?"
        description={
          pendingDelete ? `"${pendingDelete.title}" will be permanently removed. This cannot be undone.` : ''
        }
        confirmLabel="Delete snippet"
      />
    </>
  )
}
