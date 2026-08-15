import { PageHeader } from '../components/common/PageHeader'
import { EmptyState } from '../components/common/EmptyState'
import { LoadingIndicator } from '../components/common/LoadingIndicator'
import { Icon } from '../components/common/Icon'
import { ActivityRow } from '../components/activity/ActivityRow'
import { useActivity } from '../hooks/useActivity'
import './Activity.css'

export default function Activity() {
  const { activity, status, error } = useActivity()

  return (
    <>
      <PageHeader title="Activity" description="A full history of actions taken across your workspace." />

      {status === 'loading' && <LoadingIndicator label="Loading activity…" />}
      {status === 'error' && <p className="activity-page__error">Failed to load activity: {error?.message}</p>}

      {status === 'ready' && activity.length === 0 && (
        <EmptyState
          icon={<Icon name="activity" size={28} />}
          title="No activity yet"
          description="Actions you take across DevFlow — creating, editing, deleting, moving — will show up here."
        />
      )}

      {status === 'ready' && activity.length > 0 && (
        <ul className="activity-page__list">
          {activity.map((entry) => (
            <li key={entry.id}>
              <ActivityRow entry={entry} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
