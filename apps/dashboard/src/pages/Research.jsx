import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight } from 'lucide-react'
import { backtestResults, marketRegime, abTests } from '../data/mock'

export default function Research() {
  const regimeColors = {
    'Bullish Volatile': { bg: 'var(--accent-teal-dim)', color: 'var(--accent-teal)', border: 'rgba(0,212,170,0.3)' },
    'Bearish': { bg: 'var(--accent-red-dim)', color: 'var(--accent-red)', border: 'rgba(239,68,68,0.3)' },
    'Ranging': { bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)', border: 'rgba(245,158,11,0.3)' },
  }
  const rc = regimeColors[marketRegime.current] || regimeColors['Ranging']

  return (
    <div>
      <div className="page-header">
        <h1>Research</h1>
      </div>

      <div className="grid-1-1 section">
        <div className="card">
          <h3 className="section-title">Market Regime Detection</h3>
          <div style={{ textAlign: 'center', padding: 'var(--space-lg) 0' }}>
            <div className="regime-badge regime-badge--bullish" style={{
              background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
              fontSize: 'var(--fs-display)', padding: 'var(--space-lg) var(--space-xl)',
            }}>
              {marketRegime.current}
            </div>
            <div style={{ marginTop: 'var(--space-md)', fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
              Confidence: <span style={{ fontWeight: 700, color: rc.color }}>{marketRegime.confidence}%</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
            {Object.entries(marketRegime.indicators).map(([key, val]) => (
              <div key={key} style={{
                background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)',
                padding: 'var(--space-md)', border: '1px solid var(--border-subtle)',
              }}>
                <div style={{ fontSize: 'var(--fs-overline)', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
                  {key}
                </div>
                <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {val}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Backtest Results */}
      <div className="card section">
        <h3 className="section-title">Backtest Engine — Equity Curve</h3>
        <div style={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={backtestResults}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.4} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} interval={14} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', fontSize: 'var(--fs-caption)',
                }}
              />
              <Line type="monotone" dataKey="benchmark" stroke="var(--text-tertiary)" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Benchmark" />
              <Line type="monotone" dataKey="strategy" stroke="var(--accent-teal)" strokeWidth={2.5} dot={false} name="Strategy" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', justifyContent: 'center', marginTop: 'var(--space-md)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
            <span style={{ width: 16, height: 2, background: 'var(--accent-teal)', display: 'inline-block', borderRadius: 1 }} />
            Strategy
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--fs-caption)', color: 'var(--text-secondary)' }}>
            <span style={{ width: 16, height: 2, background: 'var(--text-tertiary)', display: 'inline-block', borderRadius: 1, borderTop: '1px dashed var(--text-tertiary)' }} />
            Benchmark
          </span>
        </div>
      </div>

      {/* A/B Testing */}
      <div className="card">
        <h3 className="section-title">Content A/B Testing</h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-caption)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                {['Test', 'Variant A', 'CTR A', 'Variant B', 'CTR B', 'Winner', 'Status'].map(h => (
                  <th key={h} style={{ padding: 'var(--space-md) var(--space-sm)', textAlign: 'left', color: 'var(--text-tertiary)', fontWeight: 600, fontSize: 'var(--fs-overline)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {abTests.map(test => (
                <tr key={test.id} style={{ borderBottom: '1px solid rgba(30,37,72,0.4)' }}>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)', fontWeight: 500, color: 'var(--text-primary)' }}>{test.name}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)', color: 'var(--text-secondary)' }}>{test.variantA}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)', fontWeight: 600, color: test.winner === 'A' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                    {test.ctrA}%
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)', color: 'var(--text-secondary)' }}>{test.variantB}</td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)', fontWeight: 600, color: test.winner === 'B' ? 'var(--accent-teal)' : 'var(--text-secondary)' }}>
                    {test.ctrB}%
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 'var(--fs-overline)', fontWeight: 600,
                      background: 'var(--accent-teal-dim)', color: 'var(--accent-teal)',
                    }}>
                      {test.winner}
                    </span>
                  </td>
                  <td style={{ padding: 'var(--space-md) var(--space-sm)' }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 12, fontSize: 'var(--fs-overline)', fontWeight: 600,
                      background: test.status === 'running' ? 'var(--accent-amber-dim)' : 'var(--accent-cyan-dim)',
                      color: test.status === 'running' ? 'var(--accent-amber)' : 'var(--accent-cyan)',
                    }}>
                      {test.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
