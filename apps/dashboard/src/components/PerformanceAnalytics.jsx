import React, { useState, useMemo } from 'react';

const PerformanceAnalytics = ({ pnlTimeseries = [] }) => {
  const [timeframe, setTimeframe] = useState('1M');
  const [chartType, setChartType] = useState('bar');
  const [hoverIndex, setHoverIndex] = useState(null);

  // Use real P&L data if available, otherwise generate placeholder
  const data = useMemo(() => {
    if (pnlTimeseries && pnlTimeseries.length > 0) {
      // Use real data — filter by timeframe
      const now = new Date();
      let cutoff = new Date();
      switch (timeframe) {
        case '1W': cutoff.setDate(now.getDate() - 7); break;
        case '1M': cutoff.setMonth(now.getMonth() - 1); break;
        case '3M': cutoff.setMonth(now.getMonth() - 3); break;
        case '1Y': cutoff.setFullYear(now.getFullYear() - 1); break;
        default: cutoff.setMonth(now.getMonth() - 1);
      }
      const filtered = pnlTimeseries.filter(d => {
        if (!d.date || d.date === 'unknown') return true;
        return new Date(d.date) >= cutoff;
      });

      if (filtered.length === 0) {
        return [{ label: 'No data', pnl: 0, isLoss: false }];
      }

      return filtered.map(d => ({
        label: d.date !== 'unknown' ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—',
        pnl: Math.round(d.cumulative * 100) / 100,
        dailyPnl: Math.round(d.pnl * 100) / 100,
        isLoss: d.cumulative < 0,
      }));
    }

    // Fallback: show empty state
    return [{ label: 'Awaiting data', pnl: 0, isLoss: false }];
  }, [pnlTimeseries, timeframe]);

  const maxPnl = Math.max(...data.map(d => Math.abs(d.pnl)), 1);

  const renderLineChart = () => {
    const width = 1000;
    const height = 240;

    const points = data.map((d, i) => {
      const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
      const normalizedPnl = (d.pnl + maxPnl) / (maxPnl * 2);
      const y = height - (normalizedPnl * height * 0.8 + height * 0.1);
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="absolute inset-0 pt-4 pb-8 pl-4 pr-4 z-10 w-full h-full flex items-end">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full preserve-3d overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#00d6ab" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#00d6ab" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,${height} ${points} ${width},${height}`}
            fill="url(#lineGradient)"
            className="transition-all duration-500 ease-in-out"
          />
          <polyline
            points={points}
            fill="none"
            stroke="#00d6ab"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-500 ease-in-out filter drop-shadow-sm"
          />
          {data.map((d, i) => {
            const x = data.length > 1 ? (i / (data.length - 1)) * width : width / 2;
            const normalizedPnl = (d.pnl + maxPnl) / (maxPnl * 2);
            const y = height - (normalizedPnl * height * 0.8 + height * 0.1);
            return (
              <g key={i} className="cursor-pointer group outline-none" tabIndex="0"
                onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
                {hoverIndex === i && (
                  <line x1={x} y1={0} x2={x} y2={height} stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" className="text-slate-300 dark:text-primary/20" />
                )}
                <circle cx={x} cy={y} r={hoverIndex === i ? 6 : 4}
                  fill={d.isLoss ? "#ef4444" : "#00d6ab"} stroke="#0f231f" strokeWidth="2" className="transition-all duration-200" />
                {hoverIndex === i && (
                  <foreignObject x={x - 60} y={Math.max(0, y - 50)} width="120" height="40" className="overflow-visible z-50">
                    <div className="bg-background-dark border border-primary/20 shadow-xl rounded-lg px-3 py-1.5 flex flex-col items-center justify-center animate-fade-in pointer-events-none">
                      <span className={`font-bold text-xs ${d.isLoss ? 'text-rose-400' : 'text-primary'}`}>
                        {d.pnl > 0 ? '+' : ''}${Math.abs(d.pnl).toLocaleString()}
                      </span>
                    </div>
                  </foreignObject>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl rounded-2xl p-6 shadow-sm h-full flex flex-col relative transition-all duration-300">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Performance Analytics</h3>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-[var(--text-secondary)] font-bold uppercase tracking-wider">PnL over</p>
            <div className="flex rounded-xl p-1 border border-[var(--border)]">
              {['1W', '1M', '3M', '1Y'].map(tf => (
                <button key={tf} onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${timeframe === tf ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
                  {tf}
                </button>
              ))}
            </div>
            {pnlTimeseries.length > 0 && (
              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest">Live</span>
            )}
          </div>
        </div>
        <div className="flex p-1 rounded-xl border border-[var(--border)]">
          <button onClick={() => setChartType('line')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${chartType === 'line' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <span className="material-symbols-outlined text-[14px]">show_chart</span> Line
          </button>
          <button onClick={() => setChartType('bar')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1 transition-all ${chartType === 'bar' ? 'bg-primary text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
            <span className="material-symbols-outlined text-[14px]">bar_chart</span> Bar
          </button>
        </div>
      </div>

      <div className="h-[300px] w-full relative flex items-end justify-between gap-1 group pb-6 flex-1">
        {chartType === 'line' && renderLineChart()}
        {data.map((d, i) => {
          const heightPercent = Math.max(10, (Math.abs(d.pnl) / maxPnl) * 80);
          return (
            <div key={i} className="flex flex-col flex-1 gap-2 items-center group/bar relative h-full justify-end z-20">
              {chartType === 'bar' && (
                <div
                  className={`w-full rounded-t-lg transition-all duration-500 ease-out cursor-pointer border border-[var(--border)] shadow-sm ${d.isLoss
                      ? 'bg-rose-500/60 group-hover/bar:bg-rose-500/80 hover:!bg-rose-500 border-rose-500/20'
                      : 'bg-emerald-500/60 group-hover/bar:bg-emerald-500/80 hover:!bg-emerald-500 border-emerald-500/20'
                    }`}
                  style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  <div className={`absolute -top-10 left-1/2 -translate-x-1/2 bg-background-dark border border-primary/20 shadow-xl text-white text-[10px] py-1.5 px-2 rounded-lg opacity-0 transition-opacity pointer-events-none whitespace-nowrap z-50 flex flex-col items-center ${hoverIndex === i ? 'opacity-100' : ''}`}>
                    <span className={`font-bold text-xs ${d.isLoss ? 'text-rose-400' : 'text-primary'}`}>
                      {d.pnl > 0 ? '+' : ''}${Math.abs(d.pnl).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              <span className={`absolute bottom-0 text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${hoverIndex === i ? (d.isLoss ? 'text-rose-500' : 'text-primary scale-110') : 'text-[var(--text-secondary)] opacity-60'}`}>
                {d.label}
              </span>
            </div>
          );
        })}
        <div className="absolute bottom-6 left-0 right-0 h-px bg-[var(--bg-surface)] z-0 border-b border-dashed border-[var(--border)]"></div>
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
