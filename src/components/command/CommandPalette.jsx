import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../common/Modal'
import { Icon } from '../common/Icon'
import { LoadingIndicator } from '../common/LoadingIndicator'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import { useCommandPalette } from '../../hooks/useCommandPalette'
import { useTheme } from '../../context/ThemeContext'
import { SEARCH_TYPES } from '../../config/searchTypes'
import { truncate } from '../../utils/formatting'
import './CommandPalette.css'

const DEBOUNCE_MS = 150

const COMMAND_GROUP = { type: 'command', label: 'Commands', icon: null }

export function CommandPalette({ open, onClose }) {
  const navigate = useNavigate()
  const { cycleMode } = useTheme()
  const { search, indexStatus } = useGlobalSearch()
  const [query, setQuery] = useState('')
  const [grouped, setGrouped] = useState({})
  const [searching, setSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const requestSeq = useRef(0)

  const commandMatches = useCommandPalette(query)

  useEffect(() => {
    if (!open) {
      setQuery('')
      setGrouped({})
      setActiveIndex(0)
    }
  }, [open])

  useEffect(() => {
    const seq = ++requestSeq.current
    if (!query.trim()) {
      setGrouped({})
      setSearching(false)
      return undefined
    }
    setSearching(true)
    const timer = setTimeout(async () => {
      try {
        const result = await search(query)
        if (seq !== requestSeq.current) return
        setGrouped(result)
        setActiveIndex(0)
      } finally {
        if (seq === requestSeq.current) setSearching(false)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const flatResults = useMemo(() => {
    const list = commandMatches.map((command) => ({ kind: 'command', command, meta: COMMAND_GROUP }))
    for (const meta of SEARCH_TYPES) {
      for (const doc of grouped[meta.type] ?? []) {
        list.push({ kind: 'content', doc, meta })
      }
    }
    return list
  }, [commandMatches, grouped])

  useEffect(() => {
    setActiveIndex((i) => Math.min(i, Math.max(flatResults.length - 1, 0)))
  }, [flatResults.length])

  const runCommand = (command) => {
    switch (command.action.type) {
      case 'navigate':
        navigate(command.action.path)
        break
      case 'navigate-create':
        navigate(command.action.path, { state: { openCreate: true } })
        break
      case 'theme-cycle':
        cycleMode()
        break
      default:
        break
    }
    onClose()
  }

  const openEntry = (entry) => {
    if (!entry) return
    if (entry.kind === 'command') runCommand(entry.command)
    else {
      navigate(entry.meta.path(entry.doc))
      onClose()
    }
  }

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatResults.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      openEntry(flatResults[activeIndex])
    }
  }

  const contentGroupsEmpty = SEARCH_TYPES.every((meta) => !(grouped[meta.type]?.length > 0))

  return (
    <Modal open={open} onClose={onClose} labelledBy="command-palette-title" className="command-palette">
      <h2 id="command-palette-title" className="visually-hidden">
        Command palette
      </h2>
      <div className="command-palette__input-row">
        <Icon name="search" size={16} />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search or run a command…"
          aria-label="Command palette"
          aria-activedescendant={flatResults[activeIndex] ? `palette-result-${activeIndex}` : undefined}
          role="combobox"
          aria-expanded={flatResults.length > 0}
          aria-controls="palette-results-list"
        />
        <kbd>Esc</kbd>
      </div>

      <div className="command-palette__results" id="palette-results-list" role="listbox">
        {commandMatches.length > 0 && (
          <div className="command-palette__group">
            <div className="command-palette__group-label">Commands</div>
            {commandMatches.map((command) => {
              const index = flatResults.findIndex((e) => e.kind === 'command' && e.command.id === command.id)
              return (
                <button
                  key={command.id}
                  id={`palette-result-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? 'command-palette__result command-palette__result--active'
                      : 'command-palette__result'
                  }
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => runCommand(command)}
                >
                  <Icon name={command.icon} size={15} />
                  <span className="command-palette__result-title">{command.label}</span>
                </button>
              )
            })}
          </div>
        )}

        {query.trim() !== '' && searching && <LoadingIndicator label="Searching…" inline />}

        {query.trim() !== '' &&
          !searching &&
          contentGroupsEmpty &&
          commandMatches.length === 0 && (
            <p className="command-palette__message">No results for "{query}".</p>
          )}

        {query.trim() === '' && commandMatches.length === 0 && indexStatus !== 'error' && (
          <p className="command-palette__message">Type to search or run a command.</p>
        )}

        {SEARCH_TYPES.map((meta) => {
          const docs = grouped[meta.type]
          if (!docs || docs.length === 0) return null
          return (
            <div key={meta.type} className="command-palette__group">
              <div className="command-palette__group-label">{meta.label}</div>
              {docs.map((doc) => {
                const index = flatResults.findIndex(
                  (e) => e.kind === 'content' && e.doc.id === doc.id && e.meta.type === meta.type,
                )
                return (
                  <button
                    key={doc.id}
                    id={`palette-result-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    className={
                      index === activeIndex
                        ? 'command-palette__result command-palette__result--active'
                        : 'command-palette__result'
                    }
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => openEntry({ kind: 'content', doc, meta })}
                  >
                    <Icon name={meta.icon} size={15} />
                    <div className="command-palette__result-text">
                      <span className="command-palette__result-title">{doc.title}</span>
                      {doc.subtitle && (
                        <span className="command-palette__result-subtitle">{truncate(doc.subtitle, 80)}</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </Modal>
  )
}
