import { Link } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { SEARCH_TYPES } from '../../config/searchTypes'
import { formatRelativeTime } from '../../utils/formatting'
import './ActivityRow.css'

export function ActivityRow({ entry }) {
  const meta = SEARCH_TYPES.find((t) => t.type === entry.entityType)
  const label = entry.metadata?.title ?? entry.metadata?.name ?? ''
  const path = meta && entry.entityId ? meta.path({ id: entry.entityId }) : null

  const content = (
    <>
      <Icon name={meta?.icon ?? 'activity'} size={15} />
      <span className="activity-row__text">
        <span className="activity-row__action">{entry.action}</span>
        {label && <span className="activity-row__label">{label}</span>}
      </span>
      <span className="activity-row__time">{formatRelativeTime(entry.timestamp)}</span>
    </>
  )

  return path ? (
    <Link to={path} className="activity-row activity-row--link">
      {content}
    </Link>
  ) : (
    <div className="activity-row">{content}</div>
  )
}
