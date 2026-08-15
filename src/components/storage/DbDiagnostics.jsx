import { useState } from 'react'
import { useIndexedDB } from '../../hooks/useIndexedDB'
import { STORES } from '../../db/database'
import * as projectsStore from '../../db/projectsStore'
import * as notesStore from '../../db/notesStore'
import * as tasksStore from '../../db/tasksStore'
import * as snippetsStore from '../../db/snippetsStore'
import * as activityStore from '../../db/activityStore'
import { Icon } from '../common/Icon'
import './DbDiagnostics.css'

const COUNTERS = [
  { key: STORES.projects, label: 'Projects', count: projectsStore.countProjects },
  { key: STORES.notes, label: 'Notes', count: notesStore.countNotes },
  { key: STORES.tasks, label: 'Tasks', count: tasksStore.countTasks },
  { key: STORES.snippets, label: 'Snippets', count: snippetsStore.countSnippets },
  { key: STORES.activity, label: 'Activity', count: activityStore.countActivity },
]

async function loadCounts() {
  const entries = await Promise.all(COUNTERS.map((c) => c.count()))
  return Object.fromEntries(COUNTERS.map((c, i) => [c.key, entries[i]]))
}

async function runSelfTest(onStep) {
  const marker = `__selftest__${Date.now()}`

  onStep('Create project', 'running')
  const project = await projectsStore.createProject({ name: marker, description: 'self-test' })
  onStep('Create project', 'pass')

  onStep('Create note, task, snippet', 'running')
  const note = await notesStore.createNote({ title: marker, projectId: project.id })
  const task = await tasksStore.createTask({ title: marker, projectId: project.id })
  const snippet = await snippetsStore.createSnippet({ title: marker, projectId: project.id })
  onStep('Create note, task, snippet', 'pass')

  onStep('Read back by id', 'running')
  const readProject = await projectsStore.getProject(project.id)
  if (!readProject || readProject.name !== marker) throw new Error('Readback mismatch for project')
  onStep('Read back by id', 'pass')

  onStep('Query by index (projectId)', 'running')
  const projectNotes = await notesStore.getNotesByProject(project.id)
  if (!projectNotes.some((n) => n.id === note.id)) throw new Error('Index query failed for notes')
  onStep('Query by index (projectId)', 'pass')

  onStep('Update record', 'running')
  const updated = await projectsStore.updateProject(project.id, { description: 'updated' })
  if (updated.description !== 'updated') throw new Error('Update did not persist')
  onStep('Update record', 'pass')

  onStep('Log activity entry', 'running')
  await activityStore.logActivity({ action: 'self-test', entityType: 'project', entityId: project.id })
  onStep('Log activity entry', 'pass')

  onStep('Clean up test records', 'running')
  await projectsStore.deleteProject(project.id)
  await notesStore.deleteNote(note.id)
  await tasksStore.deleteTask(task.id)
  await snippetsStore.deleteSnippet(snippet.id)
  const remaining = await projectsStore.getProject(project.id)
  if (remaining) throw new Error('Delete did not persist')
  onStep('Clean up test records', 'pass')
}

export function DbDiagnostics() {
  const { status, error } = useIndexedDB()
  const [counts, setCounts] = useState(null)
  const [steps, setSteps] = useState([])
  const [testError, setTestError] = useState(null)
  const [running, setRunning] = useState(false)

  const refreshCounts = async () => {
    try {
      setCounts(await loadCounts())
    } catch (err) {
      setTestError(err.message)
    }
  }

  const handleRunTest = async () => {
    setRunning(true)
    setTestError(null)
    setSteps([])
    const record = (label, state) =>
      setSteps((prev) => {
        const next = prev.filter((s) => s.label !== label)
        return [...next, { label, state }]
      })
    try {
      await runSelfTest(record)
      await refreshCounts()
    } catch (err) {
      setTestError(err.message)
    } finally {
      setRunning(false)
    }
  }

  if (status === 'unsupported') {
    return (
      <p className="db-diagnostics__error">
        IndexedDB is not available in this browser. DevFlow requires it for local persistence.
      </p>
    )
  }

  if (status === 'error') {
    return <p className="db-diagnostics__error">Database failed to open: {error?.message}</p>
  }

  return (
    <div className="db-diagnostics">
      <div className="db-diagnostics__counts">
        {COUNTERS.map((c) => (
          <div key={c.key} className="db-diagnostics__count">
            <span className="db-diagnostics__count-value">
              {counts ? counts[c.key] : '—'}
            </span>
            <span className="db-diagnostics__count-label">{c.label}</span>
          </div>
        ))}
      </div>

      <div className="db-diagnostics__actions">
        <button onClick={refreshCounts} disabled={status !== 'ready'}>
          Refresh counts
        </button>
        <button onClick={handleRunTest} disabled={status !== 'ready' || running}>
          {running ? 'Running self-test…' : 'Run database self-test'}
        </button>
      </div>

      {steps.length > 0 && (
        <ul className="db-diagnostics__steps">
          {steps.map((step) => (
            <li key={step.label}>
              <Icon name={step.state === 'pass' ? 'check' : 'close'} size={14} />
              {step.label}
            </li>
          ))}
        </ul>
      )}

      {testError && <p className="db-diagnostics__error">Self-test failed: {testError}</p>}
    </div>
  )
}
