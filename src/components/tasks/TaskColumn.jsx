import { useState } from 'react'
import { TaskCard } from './TaskCard'
import { Icon } from '../common/Icon'
import './TaskColumn.css'

export function TaskColumn({
  statusMeta,
  tasks,
  projectsById,
  onCreate,
  onEdit,
  onDelete,
  onMoveTo,
  onDrop,
  draggingId,
  onDragStart,
  onDragEnd,
}) {
  const [dragOver, setDragOver] = useState(false)

  return (
    <div
      className={`task-column${dragOver ? ' task-column--drag-over' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        const draggedId = e.dataTransfer.getData('text/plain')
        if (draggedId) onDrop(draggedId, statusMeta.value, null)
      }}
    >
      <div className="task-column__header">
        <h3>{statusMeta.label}</h3>
        <span className="task-column__count">{tasks.length}</span>
      </div>

      <div className="task-column__list">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            isDragging={task.id === draggingId}
            projectName={task.projectId ? projectsById[task.projectId] : null}
            onEdit={onEdit}
            onDelete={onDelete}
            onMoveTo={onMoveTo}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onDropBefore={(draggedId, beforeId) => onDrop(draggedId, statusMeta.value, beforeId)}
          />
        ))}
      </div>

      <button className="task-column__add" onClick={() => onCreate(statusMeta.value)}>
        <Icon name="plus" size={14} />
        Add task
      </button>
    </div>
  )
}
