import { ResponsiveContainer } from 'recharts'

export default function ChartContainer({ children, height = 300, title, actions }) {
  return (
    <div className="card">
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-md)' }}>
          {title && <h3 className="section-title" style={{ margin: 0 }}>{title}</h3>}
          {actions && <div>{actions}</div>}
        </div>
      )}
      <div className="chart-container" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
