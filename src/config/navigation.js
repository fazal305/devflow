/**
 * Single source of truth for primary navigation.
 * Sidebar, mobile nav, and the command palette's "go to" commands
 * are all generated from this list.
 */
export const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'dashboard' },
  { id: 'projects', label: 'Projects', path: '/projects', icon: 'projects' },
  { id: 'tasks', label: 'Tasks', path: '/tasks', icon: 'tasks' },
  { id: 'notes', label: 'Notes', path: '/notes', icon: 'notes' },
  { id: 'snippets', label: 'Snippets', path: '/snippets', icon: 'snippets' },
  { id: 'activity', label: 'Activity', path: '/activity', icon: 'activity' },
  { id: 'storage', label: 'Storage Inspector', path: '/storage', icon: 'storage' },
  { id: 'performance', label: 'Performance', path: '/performance', icon: 'performance' },
  { id: 'settings', label: 'Settings', path: '/settings', icon: 'settings' },
]
