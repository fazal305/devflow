import { useIndexedDB } from '../../hooks/useIndexedDB'
import { useStorageEstimate } from '../../hooks/useStorageEstimate'
import { DB_NAME, DB_VERSION } from '../../db/database'
import { formatBytes } from '../../utils/formatting'
import { Icon } from '../common/Icon'
import './StorageOverview.css'

const STATUS_META = {
  checking: { label: 'Checking…', tone: 'neutral' },
  ready: { label: 'Connected', tone: 'success' },
  error: { label: 'Error', tone: 'danger' },
  unsupported: { label: 'Unsupported', tone: 'danger' },
}

export function StorageOverview() {
  const { status } = useIndexedDB()
  const { estimate, supported } = useStorageEstimate()
  const meta = STATUS_META[status] ?? STATUS_META.checking

  const percentUsed = estimate && estimate.quota > 0 ? Math.min(100, (estimate.usage / estimate.quota) * 100) : 0

  return (
    <div className="storage-overview">
      <div className="storage-overview__row">
        <div className="storage-overview__field">
          <span className="storage-overview__label">Database</span>
          <span className="storage-overview__value">
            {DB_NAME} (v{DB_VERSION})
          </span>
        </div>
        <div className="storage-overview__field">
          <span className="storage-overview__label">Status</span>
          <span className={`storage-overview__badge storage-overview__badge--${meta.tone}`}>
            <Icon name={status === 'ready' ? 'check' : 'close'} size={12} />
            {meta.label}
          </span>
        </div>
      </div>

      <div className="storage-overview__quota">
        <div className="storage-overview__quota-header">
          <span className="storage-overview__label">Browser storage quota</span>
          <span className="storage-overview__value">
            {supported && estimate
              ? `${formatBytes(estimate.usage)} of ${formatBytes(estimate.quota)}`
              : 'Unavailable'}
          </span>
        </div>
        {supported && estimate && (
          <div className="storage-overview__bar">
            <div className="storage-overview__bar-fill" style={{ width: `${percentUsed}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}
