import { useEffect, useState } from 'react'
import { PageHeader } from '../components/common/PageHeader'
import { MetricRow } from '../components/performance/MetricRow'
import { StatusBadge } from '../components/common/StatusBadge'
import { useNavigationTiming } from '../hooks/useNavigationTiming'
import { useFPS } from '../hooks/useFPS'
import { useMemoryInfo } from '../hooks/useMemoryInfo'
import { useNetwork } from '../context/NetworkContext'
import { useServiceWorkerStatus } from '../context/ServiceWorkerContext'
import { useIndexedDB } from '../hooks/useIndexedDB'
import { useStorageEstimate } from '../hooks/useStorageEstimate'
import { isMarkdownWorkerSupported, isMarkdownWorkerActive } from '../workers/markdownWorkerClient'
import { isSearchWorkerSupported, isSearchWorkerActive } from '../workers/searchWorkerClient'
import { formatBytes } from '../utils/formatting'
import './Performance.css'

const SW_STATUS_META = {
  unsupported: { label: 'Unsupported', tone: 'warning' },
  registering: { label: 'Registering…', tone: 'neutral' },
  active: { label: 'Active', tone: 'success' },
  'update-available': { label: 'Update ready', tone: 'warning' },
  error: { label: 'Error', tone: 'danger' },
}

const DB_STATUS_META = {
  checking: { label: 'Checking…', tone: 'neutral' },
  ready: { label: 'Connected', tone: 'success' },
  error: { label: 'Error', tone: 'danger' },
  unsupported: { label: 'Unsupported', tone: 'danger' },
}

function useWorkerStatus() {
  const [status, setStatus] = useState({
    markdown: { supported: isMarkdownWorkerSupported(), active: isMarkdownWorkerActive() },
    search: { supported: isSearchWorkerSupported(), active: isSearchWorkerActive() },
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus({
        markdown: { supported: isMarkdownWorkerSupported(), active: isMarkdownWorkerActive() },
        search: { supported: isSearchWorkerSupported(), active: isSearchWorkerActive() },
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return status
}

export default function Performance() {
  const timing = useNavigationTiming()
  const fps = useFPS()
  const memory = useMemoryInfo()
  const { isOnline } = useNetwork()
  const { status: swStatus } = useServiceWorkerStatus()
  const { status: dbStatus } = useIndexedDB()
  const { estimate, supported: quotaSupported } = useStorageEstimate()
  const workers = useWorkerStatus()

  return (
    <>
      <PageHeader
        title="Performance"
        description="Real, browser-reported metrics: load time, FPS, memory, worker and storage status."
      />

      <div className="performance-grid">
        <section className="performance-card">
          <h2>Page load</h2>
          <MetricRow label="Time to first byte" value={`${timing?.ttfb} ms`} unavailable={!timing} />
          <MetricRow label="DOM interactive" value={`${timing?.domInteractive} ms`} unavailable={!timing} />
          <MetricRow
            label="DOM content loaded"
            value={`${timing?.domContentLoaded} ms`}
            unavailable={!timing}
          />
          <MetricRow label="Full load" value={`${timing?.loadComplete} ms`} unavailable={!timing} />
        </section>

        <section className="performance-card">
          <h2>Runtime</h2>
          <MetricRow label="Frames per second" value={`${fps} fps`} unavailable={fps === null} />
          <MetricRow
            label="JS heap used"
            value={memory ? formatBytes(memory.usedJSHeapSize) : null}
            unavailable={!memory}
          />
          <MetricRow
            label="JS heap limit"
            value={memory ? formatBytes(memory.jsHeapSizeLimit) : null}
            unavailable={!memory}
          />
        </section>

        <section className="performance-card">
          <h2>Web workers</h2>
          <MetricRow
            label="Search worker"
            value={!workers.search.supported ? null : workers.search.active ? 'Active' : 'Idle (not started)'}
            unavailable={!workers.search.supported}
          />
          <MetricRow
            label="Markdown worker"
            value={
              !workers.markdown.supported ? null : workers.markdown.active ? 'Active' : 'Idle (not started)'
            }
            unavailable={!workers.markdown.supported}
          />
        </section>

        <section className="performance-card">
          <h2>System status</h2>
          <div className="performance-badges">
            <StatusBadge
              icon={isOnline ? 'online' : 'offline'}
              label="Network"
              value={isOnline ? 'Online' : 'Offline'}
              tone={isOnline ? 'success' : 'warning'}
            />
            <StatusBadge
              icon="storage"
              label="IndexedDB"
              value={DB_STATUS_META[dbStatus]?.label ?? dbStatus}
              tone={DB_STATUS_META[dbStatus]?.tone}
            />
            <StatusBadge
              icon="check"
              label="Service Worker"
              value={SW_STATUS_META[swStatus]?.label ?? swStatus}
              tone={SW_STATUS_META[swStatus]?.tone}
            />
            <StatusBadge
              icon="storage"
              label="Storage used"
              value={quotaSupported && estimate ? formatBytes(estimate.usage) : 'Unavailable'}
              tone="neutral"
            />
          </div>
        </section>
      </div>
    </>
  )
}
