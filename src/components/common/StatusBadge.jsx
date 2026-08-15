import { Icon } from './Icon'
import './StatusBadge.css'

export function StatusBadge({ icon, label, value, tone = 'neutral' }) {
  return (
    <div className={`status-badge status-badge--${tone}`}>
      <Icon name={icon} size={16} />
      <div>
        <span className="status-badge__value">{value}</span>
        <span className="status-badge__label">{label}</span>
      </div>
    </div>
  )
}
