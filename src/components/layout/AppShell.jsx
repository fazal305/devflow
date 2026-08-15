import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import './AppShell.css'

export function AppShell({ children, onOpenCommandPalette }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!sidebarOpen) return undefined
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [sidebarOpen])

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
        onOpenCommandPalette={onOpenCommandPalette}
      />
      <div className="app-shell__body">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        <main id="main-content" className="app-shell__main" tabIndex={-1}>
          {children}
        </main>
      </div>
    </div>
  )
}
