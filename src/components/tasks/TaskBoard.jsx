import { useState } from 'react'
import { TaskColumn } from './TaskColumn'
import { TASK_STATUSES } from '../../config/taskOptions'
import './TaskBoard.css'

export function TaskBoard({ tasks, projectsById, onCreate, onEdit, onDelete, onMoveTo, onMove }) {
  const [draggingId, setDraggingId] = useState(null)

  const byStatus = (status) => tasks.filter((t) => t.status === status).sort((a, b) => a.order - b.order)

  return (
    <div className="task-board">
      {TASK_STATUSES.map((statusMeta) => (
        <TaskColumn
          key={statusMeta.value}
          statusMeta={statusMeta}
          tasks={byStatus(statusMeta.value)}
          projectsById={projectsById}
          draggingId={draggingId}
          onDragStart={setDraggingId}
          onDragEnd={() => setDraggingId(null)}
          onCreate={onCreate}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveTo={onMoveTo}
          onDrop={(draggedId, status, beforeId) => {
            onMove(draggedId, status, beforeId)
            setDraggingId(null)
          }}
        />
      ))}
    </div>
  )
}
