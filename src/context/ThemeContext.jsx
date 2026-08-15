import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext(null)
const STORAGE_KEY = 'devflow:theme'
const MODES = ['dark', 'light', 'system']

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
}

function resolveTheme(mode) {
  return mode === 'system' ? getSystemTheme() : mode
}

export function ThemeProvider({ children }) {
  const [mode, setModeState] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return MODES.includes(stored) ? stored : 'dark'
  })
  const [resolvedTheme, setResolvedTheme] = useState(() => resolveTheme(mode))

  useEffect(() => {
    const applied = resolveTheme(mode)
    setResolvedTheme(applied)
    document.documentElement.setAttribute('data-theme', applied)
    localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  useEffect(() => {
    if (mode !== 'system') return undefined
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const listener = () => {
      const applied = getSystemTheme()
      setResolvedTheme(applied)
      document.documentElement.setAttribute('data-theme', applied)
    }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [mode])

  const setMode = useCallback((next) => {
    if (!MODES.includes(next)) return
    setModeState(next)
  }, [])

  const cycleMode = useCallback(() => {
    setModeState((current) => MODES[(MODES.indexOf(current) + 1) % MODES.length])
  }, [])

  const value = useMemo(
    () => ({ mode, resolvedTheme, setMode, cycleMode }),
    [mode, resolvedTheme, setMode, cycleMode],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
