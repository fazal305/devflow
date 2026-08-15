import { Link } from 'react-router-dom'
import { Icon } from '../common/Icon'
import { Badge } from '../common/Badge'
import { PROJECT_STATUSES } from '../../config/projectOptions'
import { formatRelativeTime, truncate } from '../../utils/formatting'
import './ProjectCard.css'

export function ProjectCard({ project, onEdit, onDelete, onArchive, onRestore }) {
  const statusMeta = PROJECT_STATUSES.find((s) => s.value === project.status)

  return (
    <div className="project-card">
      <div className="project-card__header">
        <Link to={`/projects/${project.id}`} className="project-card__name">
          {project.name}
        </Link>
        {statusMeta && <Badge tone={statusMeta.tone}>{statusMeta.label}</Badge>}
      </div>

      {project.description && (
        <p className="project-card__description">{truncate(project.description, 120)}</p>
      )}

      {project.tags.length > 0 && (
        <div className="project-card__tags">
          {project.tags.map((tag) => (
            <span key={tag} className="project-card__tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="project-card__footer">
        <span className="project-card__updated">Updated {formatRelativeTime(project.updatedAt)}</span>
        <div className="project-card__actions">
          <button aria-label={`Edit ${project.name}`} onClick={() => onEdit(project)}>
            <Icon name="settings" size={15} />
          </button>
          {project.archived ? (
            <button aria-label={`Restore ${project.name}`} onClick={() => onRestore(project.id)}>
              <Icon name="check" size={15} />
            </button>
          ) : (
            <button aria-label={`Archive ${project.name}`} onClick={() => onArchive(project.id)}>
              <Icon name="storage" size={15} />
            </button>
          )}
          <button aria-label={`Delete ${project.name}`} onClick={() => onDelete(project)}>
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
