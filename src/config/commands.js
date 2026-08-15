/**
 * Command palette actions. `action.type` is interpreted by CommandPalette,
 * which has access to router navigation and the theme context — this file
 * stays a plain, declarative list so new commands are one entry, not new code.
 */
export const COMMANDS = [
  { id: 'create-project', label: 'Create Project', icon: 'projects', action: { type: 'navigate-create', path: '/projects' } },
  { id: 'create-note', label: 'Create Note', icon: 'notes', action: { type: 'navigate-create', path: '/notes' } },
  { id: 'create-task', label: 'Create Task', icon: 'tasks', action: { type: 'navigate-create', path: '/tasks' } },
  { id: 'create-snippet', label: 'Create Snippet', icon: 'snippets', action: { type: 'navigate-create', path: '/snippets' } },
  { id: 'toggle-theme', label: 'Toggle Theme', icon: 'monitor', action: { type: 'theme-cycle' } },
  { id: 'open-settings', label: 'Open Settings', icon: 'settings', action: { type: 'navigate', path: '/settings' } },
  { id: 'open-storage', label: 'Open Storage Inspector', icon: 'storage', action: { type: 'navigate', path: '/storage' } },
  { id: 'open-performance', label: 'Open Performance Monitor', icon: 'performance', action: { type: 'navigate', path: '/performance' } },
  { id: 'export-workspace', label: 'Export Workspace', icon: 'download', action: { type: 'navigate', path: '/settings' } },
  { id: 'import-workspace', label: 'Import Workspace', icon: 'upload', action: { type: 'navigate', path: '/settings' } },
]
