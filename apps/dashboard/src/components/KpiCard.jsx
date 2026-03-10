import { Area, AreaChart, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { getAnimatedStyle } from '../utils/animate'

export default function KpiCard({ label, value, delta, trend, accent = 'teal', index = 0 }) {
  const isPositive = delta >= 0
  const accentClass = `card--${accent}`

  return (
    <div className={`card ${accentClass}`} style={getAnimatedStyle(index)}>
      <div className="kpi-overline">{label}</div>
      <div className="kpi-value" style={{ color: `var(--accent-${accent})` }}>
        {value}
      </div>
      <div className={`kpi-delta ${isPositive ? 'kpi-delta--positive' : 'kpi-delta--negative'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {isPositive ? '+' : ''}{delta}%
      </div>
      {trend && trend.length > 0 && (
        <div className="kpi-sparkline">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend.map((v, i) => ({ v, i }))}>
              <defs>
                <linearGradient id={`spark-${accent}-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--accent-${accent})`} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={`var(--accent-${accent})`} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={`var(--accent-${accent})`}
                strokeWidth={2}
                fill={`url(#spark-${accent}-${index})`}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
