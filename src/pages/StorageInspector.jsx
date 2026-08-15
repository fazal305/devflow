import { PageHeader } from '../components/common/PageHeader'
import { StorageOverview } from '../components/storage/StorageOverview'
import { StoreBrowser } from '../components/storage/StoreBrowser'
import { useWorkspace } from '../context/WorkspaceContext'
import './StorageInspector.css'

export default function StorageInspector() {
  const { state } = useWorkspace()

  return (
    <>
      <PageHeader
        title="Storage Inspector"
        description="Inspect IndexedDB object stores, record counts, and approximate storage usage."
      />

      <div className="storage-inspector">
        <StorageOverview />

        <div className="storage-inspector__stores">
          <StoreBrowser
            name="Projects"
            items={state.projects.items}
            getLabel={(p) => p.name}
          />
          <StoreBrowser
            name="Notes"
            items={state.notes.items}
            getLabel={(n) => n.title || 'Untitled note'}
          />
          <StoreBrowser
            name="Tasks"
            items={state.tasks.items}
            getLabel={(t) => t.title}
          />
          <StoreBrowser
            name="Snippets"
            items={state.snippets.items}
            getLabel={(s) => s.title}
          />
          <StoreBrowser
            name="Activity"
            items={state.activity.items}
            getLabel={(a) => a.action}
            timestampField="timestamp"
          />
        </div>
      </div>
    </>
  )
}
