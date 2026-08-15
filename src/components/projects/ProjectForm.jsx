import { useId, useState } from 'react'
import { Modal } from '../common/Modal'
import { PROJECT_STATUSES } from '../../config/projectOptions'
import { validateProject, parseTagsInput } from '../../utils/validation'
import './ProjectForm.css'

export function ProjectForm({ open, onClose, onSubmit, initialValue, title }) {
  const titleId = useId()
  const [values, setValues] = useState(() => ({
    name: initialValue?.name ?? '',
    description: initialValue?.description ?? '',
    status: initialValue?.status ?? 'active',
    tags: initialValue?.tags?.join(', ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateProject(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        name: values.name.trim(),
        description: values.description.trim(),
        status: values.status,
        tags: parseTagsInput(values.tags),
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
      <form className="project-form" onSubmit={handleSubmit}>
        <h2 id={titleId} className="project-form__title">
          {title}
        </h2>

        <label className="project-form__field">
          <span>Name</span>
          <input
            autoFocus
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? `${titleId}-name-error` : undefined}
          />
          {errors.name && (
            <span id={`${titleId}-name-error`} className="project-form__error">
              {errors.name}
            </span>
          )}
        </label>

        <label className="project-form__field">
          <span>Description</span>
          <textarea
            rows={3}
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
          />
        </label>

        <label className="project-form__field">
          <span>Status</span>
          <select
            value={values.status}
            onChange={(e) => setValues((v) => ({ ...v, status: e.target.value }))}
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        <label className="project-form__field">
          <span>Tags (comma separated)</span>
          <input
            value={values.tags}
            onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
            placeholder="react, backend, learning"
          />
        </label>

        {errors.form && <p className="project-form__error">{errors.form}</p>}

        <div className="project-form__actions">
          <button type="button" className="project-form__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="project-form__submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
