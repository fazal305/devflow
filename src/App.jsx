import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { NetworkProvider } from './context/NetworkContext'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { ServiceWorkerProvider, useServiceWorkerStatus } from './context/ServiceWorkerContext'
import { AppShell } from './components/layout/AppShell'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { CommandPalette } from './components/command/CommandPalette'
import { UpdateBanner } from './components/common/UpdateBanner'
import { InstallBanner } from './components/common/InstallBanner'
import { useInstallPrompt } from './hooks/useInstallPrompt'

import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectWorkspace from './pages/ProjectWorkspace'
import Tasks from './pages/Tasks'
import Notes from './pages/Notes'
import Snippets from './pages/Snippets'
import Activity from './pages/Activity'
import StorageInspector from './pages/StorageInspector'
import Performance from './pages/Performance'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

function AppContent({ searchOpen, onOpenSearch, onCloseSearch }) {
  const { status, activateUpdate } = useServiceWorkerStatus()
  const { available: installAvailable, install } = useInstallPrompt()

  return (
    <>
      {status === 'update-available' && <UpdateBanner onActivate={activateUpdate} />}
      {installAvailable && <InstallBanner onInstall={install} />}
      <AppShell onOpenCommandPalette={onOpenSearch}>
        <ErrorBoundary label="This page hit an unexpected error.">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectWorkspace />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/snippets" element={<Snippets />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/storage" element={<StorageInspector />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </AppShell>
      <CommandPalette open={searchOpen} onClose={onCloseSearch} />
    </>
  )
}

export default function App() {
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <ErrorBoundary label="DevFlow failed to load.">
      <ThemeProvider>
        <NetworkProvider>
          <WorkspaceProvider>
            <ServiceWorkerProvider>
              <BrowserRouter>
                <AppContent
                  searchOpen={searchOpen}
                  onOpenSearch={() => setSearchOpen(true)}
                  onCloseSearch={() => setSearchOpen(false)}
                />
              </BrowserRouter>
            </ServiceWorkerProvider>
          </WorkspaceProvider>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
