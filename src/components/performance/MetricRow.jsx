import './MetricRow.css'

export function MetricRow({ label, value, unavailable }) {
  return (
    <div className="metric-row">
      <span className="metric-row__label">{label}</span>
      <span className={unavailable ? 'metric-row__value metric-row__value--unavailable' : 'metric-row__value'}>
        {unavailable ? 'Unavailable' : value}
      </span>
    </div>
  )
}
