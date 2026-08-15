export const SEARCH_TYPES = [
  { type: 'project', label: 'Projects', icon: 'projects', path: (doc) => `/projects/${doc.id}` },
  { type: 'note', label: 'Notes', icon: 'notes', path: (doc) => `/notes?note=${doc.id}` },
  { type: 'task', label: 'Tasks', icon: 'tasks', path: () => '/tasks' },
  { type: 'snippet', label: 'Snippets', icon: 'snippets', path: () => '/snippets' },
]
