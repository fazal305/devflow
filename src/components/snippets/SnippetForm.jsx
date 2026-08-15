import { useId, useState } from 'react'
import { Modal } from '../common/Modal'
import { SNIPPET_LANGUAGES } from '../../config/snippetLanguages'
import { useProjects } from '../../hooks/useProjects'
import { validateSnippet, parseTagsInput } from '../../utils/validation'
import './SnippetForm.css'

export function SnippetForm({ open, onClose, onSubmit, initialValue, title }) {
  const titleId = useId()
  const { activeProjects } = useProjects()
  const [values, setValues] = useState(() => ({
    title: initialValue?.title ?? '',
    language: initialValue?.language ?? 'javascript',
    description: initialValue?.description ?? '',
    code: initialValue?.code ?? '',
    projectId: initialValue?.projectId ?? '',
    tags: initialValue?.tags?.join(', ') ?? '',
  }))
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!open) return null

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validationErrors = validateSnippet(values)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        title: values.title.trim(),
        language: values.language,
        description: values.description.trim(),
        code: values.code,
        projectId: values.projectId || null,
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
    <Modal open={open} onClose={onClose} labelledBy={titleId} className="snippet-form-modal">
      <form className="snippet-form" onSubmit={handleSubmit}>
        <h2 id={titleId} className="snippet-form__title">
          {title}
        </h2>

        <div className="snippet-form__row">
          <label className="snippet-form__field">
            <span>Title</span>
            <input
              autoFocus
              value={values.title}
              onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
              aria-invalid={Boolean(errors.title)}
            />
            {errors.title && <span className="snippet-form__error">{errors.title}</span>}
          </label>

          <label className="snippet-form__field snippet-form__field--narrow">
            <span>Language</span>
            <select
              value={values.language}
              onChange={(e) => setValues((v) => ({ ...v, language: e.target.value }))}
            >
              {SNIPPET_LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="snippet-form__field">
          <span>Description</span>
          <input
            value={values.description}
            onChange={(e) => setValues((v) => ({ ...v, description: e.target.value }))}
            placeholder="What is this snippet for?"
          />
        </label>

        <label className="snippet-form__field">
          <span>Code</span>
          <textarea
            className="snippet-form__code"
            rows={10}
            spellCheck={false}
            value={values.code}
            onChange={(e) => setValues((v) => ({ ...v, code: e.target.value }))}
            placeholder="Paste or write code…"
          />
        </label>

        <div className="snippet-form__row">
          <label className="snippet-form__field">
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

          <label className="snippet-form__field">
            <span>Tags (comma separated)</span>
            <input
              value={values.tags}
              onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
              placeholder="hooks, utility"
            />
          </label>
        </div>

        {errors.form && <p className="snippet-form__error">{errors.form}</p>}

        <div className="snippet-form__actions">
          <button type="button" className="snippet-form__cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="snippet-form__submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
