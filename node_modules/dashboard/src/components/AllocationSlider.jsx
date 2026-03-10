import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

export default function AllocationSlider({ allocation, onChange }) {
  const sliders = [
    { key: 'btc', label: 'BTC Momentum Bot', color: '#f59e0b' },
    { key: 'eth', label: 'ETH Pullback Bot', color: '#8b5cf6' },
    { key: 'marketing', label: 'Marketing / Affiliate', color: '#00b4d8' },
  ]

  const total = Object.values(allocation).reduce((a, b) => a + b, 0)
  const pieData = sliders.map(s => ({ name: s.label, value: allocation[s.key], color: s.color }))

  const handleChange = (key, val) => {
    const newVal = parseInt(val)
    const diff = newVal - allocation[key]
    const otherKeys = sliders.filter(s => s.key !== key).map(s => s.key)
    const otherTotal = otherKeys.reduce((sum, k) => sum + allocation[k], 0)

    if (otherTotal === 0) return

    const newAlloc = { ...allocation, [key]: newVal }
    otherKeys.forEach(k => {
      const proportion = allocation[k] / otherTotal
      newAlloc[k] = Math.max(0, Math.round(allocation[k] - diff * proportion))
    })

    // Ensure total = 100
    const newTotal = Object.values(newAlloc).reduce((a, b) => a + b, 0)
    if (newTotal !== 100) {
      const adjustKey = otherKeys[0]
      newAlloc[adjustKey] += 100 - newTotal
    }

    onChange(newAlloc)
  }

  return (
    <div className="grid-1-1">
      <div className="card">
        <h3 className="section-title">Capital Allocator</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          {sliders.map(s => (
            <div key={s.key} className="slider-wrap">
              <div className="slider-header">
                <span className="slider-label">{s.label}</span>
                <span className="slider-value" style={{ color: s.color }}>{allocation[s.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={allocation[s.key]}
                onChange={(e) => handleChange(s.key, e.target.value)}
                style={{
                  background: `linear-gradient(to right, ${s.color} 0%, ${s.color} ${allocation[s.key]}%, var(--border-subtle) ${allocation[s.key]}%, var(--border-subtle) 100%)`
                }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 'var(--space-sm)' }}>
            <span className="text-secondary" style={{ fontSize: 'var(--fs-caption)' }}>Total</span>
            <span style={{
              fontWeight: 700,
              color: total === 100 ? 'var(--accent-teal)' : 'var(--accent-red)'
            }}>
              {total}%
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">Live Preview</h3>
        <div style={{ height: 250 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--fs-caption)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-lg)', flexWrap: 'wrap' }}>
          {sliders.map(s => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-caption)' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
              <span className="text-secondary">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
