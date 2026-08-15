import { Link } from 'react-router-dom'
import { PageHeader } from '../components/common/PageHeader'
import { Icon } from '../components/common/Icon'
import { StatusBadge } from '../components/common/StatusBadge'
import { ActivityRow } from '../components/activity/ActivityRow'
import { useProjects } from '../hooks/useProjects'
import { useNotes } from '../hooks/useNotes'
import { useTasks } from '../hooks/useTasks'
import { useSnippets } from '../hooks/useSnippets'
import { useActivity } from '../hooks/useActivity'
import { useNetwork } from '../context/NetworkContext'
import { useServiceWorkerStatus } from '../context/ServiceWorkerContext'
import { useIndexedDB } from '../hooks/useIndexedDB'
import { useStorageEstimate } from '../hooks/useStorageEstimate'
import { formatRelativeTime, truncate, formatBytes } from '../utils/formatting'
import './Dashboard.css'

const SW_STATUS_META = {
  unsupported: { label: 'Unsupported', tone: 'warning' },
  registering: { label: 'Registering…', tone: 'neutral' },
  active: { label: 'Active', tone: 'success' },
  'update-available': { label: 'Update ready', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
}

const DB_STATUS_META = {
  checking: { label: 'Checking…', tone: 'neutral' },
  ready: { label: 'Connected', tone: 'success' },
  error: { label: 'Error', tone: 'danger' },
  unsupported: { label: 'Unsupported', tone: 'danger' },
}

export default function Dashboard() {
  const { activeProjects, archivedProjects, status: projectsStatus } = useProjects()
  const { notes, status: notesStatus } = useNotes()
  const { tasks, status: tasksStatus } = useTasks()
  const { snippets, status: snippetsStatus } = useSnippets()
  const { activity, status: activityStatus } = useActivity()
  const { isOnline } = useNetwork()
  const { status: swStatus } = useServiceWorkerStatus()
  const { status: dbStatus } = useIndexedDB()
  const { estimate, supported: quotaSupported } = useStorageEstimate()

  const activeTasks = tasks.filter((t) => t.status !== 'done')
  const doneTasks = tasks.filter((t) => t.status === 'done')

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="A live overview of your workspace — projects, tasks, notes, snippets, storage, and system status."
      />

      <div className="dashboard__status">
        <StatusBadge
          icon={isOnline ? 'online' : 'offline'}
          label="Network"
          value={isOnline ? 'Online' : 'Offline'}
          tone={isOnline ? 'success' : 'warning'}
        />
        <StatusBadge
          icon="storage"
          label="IndexedDB"
          value={DB_STATUS_META[dbStatus]?.label ?? dbStatus}
          tone={DB_STATUS_META[dbStatus]?.tone}
        />
        <StatusBadge
          icon="check"
          label="Service Worker"
          value={SW_STATUS_META[swStatus]?.label ?? swStatus}
          tone={SW_STATUS_META[swStatus]?.tone}
        />
        <StatusBadge
          icon="storage"
          label="Storage used"
          value={quotaSupported && estimate ? formatBytes(estimate.usage) : 'Unavailable'}
          tone="neutral"
        />
      </div>

      <div className="dashboard__stats">
        <Link to="/projects" className="dashboard__stat">
          <Icon name="projects" size={20} />
          <div>
            <span className="dashboard__stat-value">
              {projectsStatus === 'ready' ? activeProjects.length : '—'}
            </span>
            <span className="dashboard__stat-label">Active projects</span>
          </div>
        </Link>
        <div className="dashboard__stat dashboard__stat--static">
          <Icon name="storage" size={20} />
          <div>
            <span className="dashboard__stat-value">
              {projectsStatus === 'ready' ? archivedProjects.length : '—'}
            </span>
            <span className="dashboard__stat-label">Archived projects</span>
          </div>
        </div>
        <Link to="/notes" className="dashboard__stat">
          <Icon name="notes" size={20} />
          <div>
            <span className="dashboard__stat-value">{notesStatus === 'ready' ? notes.length : '—'}</span>
            <span className="dashboard__stat-label">Notes</span>
          </div>
        </Link>
        <Link to="/tasks" className="dashboard__stat">
          <Icon name="tasks" size={20} />
          <div>
            <span className="dashboard__stat-value">{tasksStatus === 'ready' ? activeTasks.length : '—'}</span>
            <span className="dashboard__stat-label">Active tasks</span>
          </div>
        </Link>
        <div className="dashboard__stat dashboard__stat--static">
          <Icon name="check" size={20} />
          <div>
            <span className="dashboard__stat-value">{tasksStatus === 'ready' ? doneTasks.length : '—'}</span>
            <span className="dashboard__stat-label">Completed tasks</span>
          </div>
        </div>
        <Link to="/snippets" className="dashboard__stat">
          <Icon name="snippets" size={20} />
          <div>
            <span className="dashboard__stat-value">{snippetsStatus === 'ready' ? snippets.length : '—'}</span>
            <span className="dashboard__stat-label">Snippets</span>
          </div>
        </Link>
      </div>

      <div className="dashboard__columns">
        <div className="dashboard__section">
          <h2>Recent notes</h2>
          {notesStatus === 'ready' && notes.length === 0 && <p className="dashboard__empty">No notes yet.</p>}
          {notesStatus === 'ready' && notes.length > 0 && (
            <ul className="dashboard__recent-list">
              {notes.slice(0, 5).map((note) => (
                <li key={note.id}>
                  <Link to={`/notes?note=${note.id}`}>
                    <span>{note.title || 'Untitled note'}</span>
                    <span className="dashboard__recent-meta">
                      {truncate(note.content, 50)} · {formatRelativeTime(note.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard__section">
          <h2>Recent snippets</h2>
          {snippetsStatus === 'ready' && snippets.length === 0 && (
            <p className="dashboard__empty">No snippets yet.</p>
          )}
          {snippetsStatus === 'ready' && snippets.length > 0 && (
            <ul className="dashboard__recent-list">
              {snippets.slice(0, 5).map((snippet) => (
                <li key={snippet.id}>
                  <Link to="/snippets">
                    <span>{snippet.title}</span>
                    <span className="dashboard__recent-meta">
                      {snippet.language} · {formatRelativeTime(snippet.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard__section">
          <h2>Active tasks</h2>
          {tasksStatus === 'ready' && activeTasks.length === 0 && (
            <p className="dashboard__empty">No active tasks.</p>
          )}
          {tasksStatus === 'ready' && activeTasks.length > 0 && (
            <ul className="dashboard__recent-list">
              {activeTasks.slice(0, 5).map((task) => (
                <li key={task.id}>
                  <Link to="/tasks">
                    <span>{task.title}</span>
                    <span className="dashboard__recent-meta">{task.status}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard__section">
          <div className="dashboard__section-header">
            <h2>Recent activity</h2>
            <Link to="/activity" className="dashboard__section-link">
              View all
            </Link>
          </div>
          {activityStatus === 'ready' && activity.length === 0 && (
            <p className="dashboard__empty">No activity yet.</p>
          )}
          {activityStatus === 'ready' && activity.length > 0 && (
            <ul className="dashboard__activity-list">
              {activity.slice(0, 6).map((entry) => (
                <li key={entry.id}>
                  <ActivityRow entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  )
}
