export default function StatusBadge({ status }) {
  const labels = {
    live: 'Live',
    standby: 'Standby',
    offline: 'Offline',
    active: 'Active',
  }
  const variant = status === 'active' ? 'live' : status

  return (
    <span className={`status-badge status-badge--${variant}`}>
      <span className="status-dot" />
      {labels[status] || status}
    </span>
  )
}
