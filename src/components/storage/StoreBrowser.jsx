import { useState } from 'react'
import { Icon } from '../common/Icon'
import { computeStoreStats } from '../../utils/storage'
import { formatBytes, formatRelativeTime } from '../../utils/formatting'
import './StoreBrowser.css'

export function StoreBrowser({ name, items, getLabel, timestampField = 'updatedAt' }) {
  const [expanded, setExpanded] = useState(false)
  const [openRecordId, setOpenRecordId] = useState(null)
  const stats = computeStoreStats(items, timestampField)

  return (
    <div className="store-browser">
      <button
        className="store-browser__header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <Icon name="chevronDown" size={14} className={expanded ? 'store-browser__chevron store-browser__chevron--open' : 'store-browser__chevron'} />
        <span className="store-browser__name">{name}</span>
        <span className="store-browser__stat">{stats.count} records</span>
        <span className="store-browser__stat">{formatBytes(stats.bytes)}</span>
        <span className="store-browser__stat store-browser__stat--updated">
          {stats.lastUpdated ? `Updated ${formatRelativeTime(stats.lastUpdated)}` : 'No records'}
        </span>
      </button>

      {expanded && (
        <div className="store-browser__records">
          {items.length === 0 && <p className="store-browser__empty">No records in this store.</p>}
          {items.map((item) => (
            <div key={item.id} className="store-browser__record">
              <button
                className="store-browser__record-header"
                onClick={() => setOpenRecordId((id) => (id === item.id ? null : item.id))}
              >
                <span className="store-browser__record-label">{getLabel(item)}</span>
                <span className="store-browser__record-id">{item.id}</span>
              </button>
              {openRecordId === item.id && <pre className="store-browser__json">{JSON.stringify(item, null, 2)}</pre>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
