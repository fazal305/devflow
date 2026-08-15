import * as projectsStore from '../db/projectsStore'
import * as notesStore from '../db/notesStore'
import * as tasksStore from '../db/tasksStore'
import * as snippetsStore from '../db/snippetsStore'
import { logActivity } from '../db/activityStore'
import { countProjects } from '../db/projectsStore'
import { countNotes } from '../db/notesStore'
import { countTasks } from '../db/tasksStore'
import { countSnippets } from '../db/snippetsStore'

const SEEDED_FLAG = 'devflow:seeded'

async function isWorkspaceEmpty() {
  const [projects, notes, tasks, snippets] = await Promise.all([
    countProjects(),
    countNotes(),
    countTasks(),
    countSnippets(),
  ])
  return projects === 0 && notes === 0 && tasks === 0 && snippets === 0
}

/**
 * Populates a first-time visitor's empty workspace with realistic sample
 * content so the deployed demo isn't a blank slate. Runs at most once per
 * browser (guarded by localStorage) and only if the workspace is genuinely
 * empty — deleting everything afterward never triggers a re-seed.
 */
export async function seedDemoDataIfEmpty() {
  if (localStorage.getItem(SEEDED_FLAG)) return
  if (!(await isWorkspaceEmpty())) {
    localStorage.setItem(SEEDED_FLAG, '1')
    return
  }

  const roadmapProject = await projectsStore.createProject({
    name: 'DevFlow Roadmap',
    description: 'Planning and notes for DevFlow itself — a local-first developer workspace.',
    tags: ['meta', 'product'],
    status: 'active',
  })

  const portfolioProject = await projectsStore.createProject({
    name: 'Portfolio Website',
    description: 'Personal site redesign — case studies, dark mode, faster builds.',
    tags: ['react', 'personal'],
    status: 'active',
  })

  await notesStore.createNote({
    title: 'Welcome to DevFlow',
    projectId: roadmapProject.id,
    tags: ['welcome'],
    content: `# Welcome to DevFlow

This is a **local-first developer workspace** — everything you see is stored in your browser's IndexedDB. Nothing is sent to a server.

## What you can do here

- Organize work into **Projects**
- Write **Markdown notes** with live preview and autosave
- Track work on a **Kanban board** (drag and drop, or use the keyboard "Move to" menu)
- Save reusable **code snippets**
- Search everything instantly with \`Ctrl+K\`

## Try it

- Edit this note — changes save automatically
- Open the Storage Inspector to see your data living in IndexedDB
- Go offline (disconnect your network) and keep working — nothing breaks

This is sample data, seeded once for your first visit. Feel free to delete it — it won't come back.`,
  })

  await notesStore.createNote({
    title: 'Architecture notes',
    projectId: roadmapProject.id,
    tags: ['architecture'],
    content: `# Architecture

- **React** manages UI state via Context + \`useReducer\`
- **IndexedDB** is the durable source of truth (via \`idb\`)
- **Web Workers** handle search indexing, Markdown parsing, and local AI
- **Service Worker** provides offline support and caching
- **Transformers.js** runs note summarization entirely client-side

\`\`\`
User action → optimistic UI update → IndexedDB write → activity log
\`\`\`

No backend. No accounts. No API keys.`,
  })

  await notesStore.createNote({
    title: 'Redesign ideas',
    projectId: portfolioProject.id,
    tags: ['design'],
    content: `# Redesign ideas

- [ ] Dark mode that actually matches system preference
- [ ] Case study pages for the three biggest projects
- [ ] Cut the JS bundle — audit unused dependencies
- [ ] Swap the contact form for a simple mailto link

> Keep it simple. The best portfolio sites load in under a second.`,
  })

  await tasksStore.createTask({
    title: 'Design the Kanban board layout',
    description: 'Five columns, drag and drop, keyboard-accessible fallback.',
    status: 'done',
    priority: 'high',
    labels: ['ui'],
    projectId: roadmapProject.id,
  })

  await tasksStore.createTask({
    title: 'Wire up the Search Worker',
    description: 'Inverted index over projects/notes/tasks/snippets, debounced re-indexing.',
    status: 'done',
    priority: 'medium',
    labels: ['performance'],
    projectId: roadmapProject.id,
  })

  await tasksStore.createTask({
    title: 'Add local AI summarization',
    description: 'Transformers.js running in a dedicated worker, no cloud calls.',
    status: 'in-progress',
    priority: 'medium',
    labels: ['ai'],
    projectId: roadmapProject.id,
  })

  await tasksStore.createTask({
    title: 'Write case study for DevFlow',
    description: 'Architecture diagram, lessons learned, before/after.',
    status: 'todo',
    priority: 'medium',
    labels: ['writing'],
    projectId: portfolioProject.id,
  })

  await tasksStore.createTask({
    title: 'Audit unused npm dependencies',
    description: '',
    status: 'backlog',
    priority: 'low',
    labels: ['cleanup'],
    projectId: portfolioProject.id,
  })

  await tasksStore.createTask({
    title: 'Get feedback on the new nav',
    description: 'Ask three people to find the projects page without hints.',
    status: 'review',
    priority: 'low',
    labels: ['ux'],
    projectId: null,
  })

  await snippetsStore.createSnippet({
    title: 'IndexedDB store factory',
    language: 'javascript',
    description: 'Shared CRUD wrapper so components never touch raw transactions.',
    projectId: roadmapProject.id,
    tags: ['indexeddb', 'utility'],
    code: `export function createStore(storeName) {
  async function withStore(mode, fn) {
    const db = await getDB()
    const tx = db.transaction(storeName, mode)
    const result = await fn(tx.store)
    await tx.done
    return result
  }

  return {
    getAll: () => withStore('readonly', (s) => s.getAll()),
    put: (record) => withStore('readwrite', (s) => s.put(record)),
    remove: (id) => withStore('readwrite', (s) => s.delete(id)),
  }
}`,
  })

  await snippetsStore.createSnippet({
    title: 'Debounced autosave hook',
    language: 'javascript',
    description: 'Skips saving unchanged values, flushes on unmount.',
    projectId: null,
    tags: ['react', 'hooks'],
    code: `function useAutosave(value, save, { delay = 800 } = {}) {
  const [status, setStatus] = useState('idle')
  const timeoutRef = useRef(null)

  useEffect(() => {
    setStatus('pending')
    timeoutRef.current = setTimeout(async () => {
      setStatus('saving')
      await save(value)
      setStatus('saved')
    }, delay)
    return () => clearTimeout(timeoutRef.current)
  }, [value])

  return status
}`,
  })

  await snippetsStore.createSnippet({
    title: 'Contrast ratio check',
    language: 'javascript',
    description: 'WCAG relative luminance + contrast ratio, used to audit theme tokens.',
    projectId: portfolioProject.id,
    tags: ['accessibility'],
    code: `function contrast(hex1, hex2) {
  const lum = (hex) => {
    const [r, g, b] = hex.match(/\\w\\w/g)
      .map((x) => parseInt(x, 16) / 255)
      .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [a, b] = [lum(hex1), lum(hex2)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}`,
  })

  await logActivity({
    action: 'Loaded sample workspace',
    entityType: 'workspace',
    entityId: null,
    metadata: { projects: 2, notes: 3, tasks: 6, snippets: 3 },
  })

  localStorage.setItem(SEEDED_FLAG, '1')
}
