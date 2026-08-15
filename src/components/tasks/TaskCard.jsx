import { Badge } from '../common/Badge'
import { Icon } from '../common/Icon'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../config/taskOptions'
import './TaskCard.css'

export function TaskCard({
  task,
  projectName,
  isDragging,
  onEdit,
  onDelete,
  onMoveTo,
  onDragStart,
  onDragEnd,
  onDropBefore,
}) {
  const priorityMeta = TASK_PRIORITIES.find((p) => p.value === task.priority)

  return (
    <div
      className={isDragging ? 'task-card task-card--dragging' : 'task-card'}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', task.id)
        e.dataTransfer.effectAllowed = 'move'
        onDragStart(task.id)
      }}
      onDragEnd={onDragEnd}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        const draggedId = e.dataTransfer.getData('text/plain')
        if (draggedId && draggedId !== task.id) onDropBefore(draggedId, task.id)
      }}
    >
      <div className="task-card__header">
        <span className="task-card__title">{task.title}</span>
        {priorityMeta && <Badge tone={priorityMeta.tone}>{priorityMeta.label}</Badge>}
      </div>

      {task.description && <p className="task-card__description">{task.description}</p>}

      {task.labels.length > 0 && (
        <div className="task-card__labels">
          {task.labels.map((label) => (
            <span key={label} className="task-card__label">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="task-card__footer">
        <div className="task-card__meta">
          {projectName && <span className="task-card__project">{projectName}</span>}
          {task.dueDate && <span className="task-card__due">Due {task.dueDate}</span>}
        </div>
        <div className="task-card__actions">
          <select
            className="task-card__move"
            value={task.status}
            aria-label={`Move "${task.title}" to a different column`}
            onChange={(e) => onMoveTo(task.id, e.target.value)}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <button aria-label={`Edit ${task.title}`} onClick={() => onEdit(task)}>
            <Icon name="settings" size={13} />
          </button>
          <button aria-label={`Delete ${task.title}`} onClick={() => onDelete(task)}>
            <Icon name="trash" size={13} />
          </button>
        </div>
      </div>
    </div>
  )
}
