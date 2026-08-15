import { createContext, useCallback, useContext, useEffect, useReducer } from 'react'
import { getAllProjects } from '../db/projectsStore'
import { getAllNotes } from '../db/notesStore'
import { getAllTasks } from '../db/tasksStore'
import { getAllSnippets } from '../db/snippetsStore'
import { getAllActivity } from '../db/activityStore'

const WorkspaceContext = createContext(null)

/**
 * Projects, notes, tasks, and snippets all follow the same shape
 * (load / add / update / remove / restore-on-rollback), so one generic
 * slice reducer serves every entity instead of repeating the same
 * seven cases per domain.
 */
function actionTypes(entity) {
  const E = entity.toUpperCase()
  return {
    loading: `${E}_LOADING`,
    loaded: `${E}_LOADED`,
    error: `${E}_ERROR`,
    added: `${E}_ADDED`,
    updated: `${E}_UPDATED`,
    removed: `${E}_REMOVED`,
    restored: `${E}_RESTORED`,
  }
}

const ENTITY_ACTIONS = {
  projects: actionTypes('project'),
  notes: actionTypes('note'),
  tasks: actionTypes('task'),
  snippets: actionTypes('snippet'),
  activity: actionTypes('activity'),
}

const LOADERS = {
  projects: getAllProjects,
  notes: getAllNotes,
  tasks: getAllTasks,
  snippets: getAllSnippets,
  activity: getAllActivity,
}

function sliceReducer(slice, action, types) {
  switch (action.type) {
    case types.loading:
      return { ...slice, status: 'loading', error: null }
    case types.loaded:
      return { items: action.payload, status: 'ready', error: null }
    case types.error:
      return { ...slice, status: 'error', error: action.payload }
    case types.added:
      return { ...slice, items: [action.payload, ...slice.items] }
    case types.updated:
      return { ...slice, items: slice.items.map((i) => (i.id === action.payload.id ? action.payload : i)) }
    case types.removed:
      return { ...slice, items: slice.items.filter((i) => i.id !== action.payload) }
    case types.restored:
      return { ...slice, items: [...slice.items, action.payload] }
    default:
      return slice
  }
}

const initialState = {
  projects: { items: [], status: 'idle', error: null },
  notes: { items: [], status: 'idle', error: null },
  tasks: { items: [], status: 'idle', error: null },
  snippets: { items: [], status: 'idle', error: null },
  activity: { items: [], status: 'idle', error: null },
}

function reducer(state, action) {
  for (const [key, types] of Object.entries(ENTITY_ACTIONS)) {
    if (Object.values(types).includes(action.type)) {
      return { ...state, [key]: sliceReducer(state[key], action, types) }
    }
  }
  return state
}

async function loadEntity(dispatch, entity) {
  const types = ENTITY_ACTIONS[entity]
  dispatch({ type: types.loading })
  try {
    const items = await LOADERS[entity]()
    dispatch({ type: types.loaded, payload: items })
  } catch (error) {
    dispatch({ type: types.error, payload: error })
  }
}

function useEntityLoader(dispatch, entity) {
  useEffect(() => {
    loadEntity(dispatch, entity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])
}

export function WorkspaceProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEntityLoader(dispatch, 'projects')
  useEntityLoader(dispatch, 'notes')
  useEntityLoader(dispatch, 'tasks')
  useEntityLoader(dispatch, 'snippets')
  useEntityLoader(dispatch, 'activity')

  /** Re-reads a store from IndexedDB into shared state — used after bulk writes (e.g. import) that bypass the entity hooks. */
  const refreshEntity = useCallback((entity) => loadEntity(dispatch, entity), [dispatch])

  const refreshAll = useCallback(
    () => Promise.all(Object.keys(ENTITY_ACTIONS).map((entity) => loadEntity(dispatch, entity))),
    [dispatch],
  )

  return (
    <WorkspaceContext.Provider value={{ state, dispatch, refreshEntity, refreshAll }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider')
  return ctx
}
