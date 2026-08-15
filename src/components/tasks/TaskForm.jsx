import { useId, useState } from 'react'
import { Modal } from '../common/Modal'
import { TASK_STATUSES, TASK_PRIORITIES } from '../../config/taskOptions'
import { useProjects } from '../../hooks/useProjects'
import { validateTask, parseTagsInput } from '../../utils/validation'
import './TaskForm.css'

export function TaskForm({ open, onClose, onSubmit, initialValue, title, defaultStatus = 'backlog' }) {
  const titleId = useId()
  const { activeProjects } = useProjects()
  const [values, setValues] = useState(() => ({
    title: initialValue?.title ?? '',
    description: initialValue?.description ?? '',
    status: initialValue?.status ?? defaultStatus,
    priority: initialValue?.priority ?? 'medium',
    projectId: initialValue?.projectId ?? '',
    dueDate: initialValue?.dueDate ?? '',
    labels: initialValue?.labels?.join(', ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateTask(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        description: values.description.trim(),
        status: values.status,
        priority: values.priority,
        projectId: values.projectId || null,
        dueDate: values.dueDate || null,
        labels: parseTagsInput(values.labels),
      })
      onClose()
    } catch (err) {
      setErrors({ form: err.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId}>
      <form className="task-form" onSubmit={handleSubmit}>
        <h2 id={titleId} className="task-form__title">
          {title}
        </h2>

        <label className="task-form__field">
          <span>Title</span>
          <input
            autoFocus
            value={values.title}
            onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
            aria-invalid={Boolean(errors.title)}
          />
          {errors.title && <span className="task-form__error">{errors.title}</span>}
        </label>

        <label className="task-form__field">
          <span>Description</span>
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </label>

        <div className="task-form__row">
          <label className="task-form__field">
            <span>Status</span>
            <select value={values.status} onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}>
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>

          <label className="task-form__field">
            <span>Priority</span>
            <select value={values.priority} onChange={(e) => setValues((v) => ({ ...v, priority: e.target.value }))}>
              {TASK_PRIORITIES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="task-form__row">
          <label className="task-form__field">
            <span>Project</span>
            <select
              value={values.projectId}
              onChange={(e) => setValues((v) => ({ ...v, projectId: e.target.value }))}
            >
              <option value="">No project</option>
              {activeProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="task-form__field">
            <span>Due date</span>
            <input
              type="date"
              value={values.dueDate ?? ''}
              onChange={(e) => setValues((v) => ({ ...v, dueDate: e.target.value }))}
            />
          </label>
        </div>

        <label className="task-form__field">
          <span>Labels (comma separated)</span>
          <input
            value={values.labels}
            onChange={(e) => setValues((v) => ({ ...v, labels: e.target.value }))}
            placeholder="bug, frontend"
          />
        </label>

        {errors.form && <p className="task-form__error">{errors.form}</p>}

        <div className="task-form__actions">
          <button type="button" className="task-form__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="task-form__submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
