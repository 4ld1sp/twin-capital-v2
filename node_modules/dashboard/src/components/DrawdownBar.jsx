export default function DrawdownBar({ current, limit }) {
  const percentage = (current / limit) * 100
  const isDanger = percentage > 70

  return (
    <div>
      <div className="drawdown-bar">
        <div
          className={`drawdown-fill ${isDanger ? 'drawdown-fill--danger' : ''}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="drawdown-labels">
        <span style={{ fontSize: 'var(--fs-caption)', color: isDanger ? 'var(--accent-red)' : 'var(--accent-amber)', fontWeight: 600 }}>
          {current}%
        </span>
        <span style={{ fontSize: 'var(--fs-overline)', color: 'var(--text-tertiary)' }}>
          Limit: {limit}%
        </span>
      </div>
    </div>
  )
}
