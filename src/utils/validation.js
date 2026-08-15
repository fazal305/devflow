export function validateProject({ name }) {
  const errors = {}
  const trimmed = name?.trim() ?? ''
  if (!trimmed) errors.name = 'Project name is required.'
  else if (trimmed.length > 80) errors.name = 'Project name must be 80 characters or fewer.'
  return errors
}

export function validateTask({ title }) {
  const errors = {}
  const trimmed = title?.trim() ?? ''
  if (!trimmed) errors.title = 'Task title is required.'
  else if (trimmed.length > 120) errors.title = 'Task title must be 120 characters or fewer.'
  return errors
}

export function validateSnippet({ title }) {
  const errors = {}
  const trimmed = title?.trim() ?? ''
  if (!trimmed) errors.title = 'Snippet title is required.'
  else if (trimmed.length > 100) errors.title = 'Snippet title must be 100 characters or fewer.'
  return errors
}

export function parseTagsInput(value) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}
